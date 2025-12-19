<?php
session_start();
include_once 'index.php'; 
include_once 'getuser.php';

header('Content-Type: application/json');

if (!isset($_SESSION['userID']) || !isset($_SESSION['phoneNumber'])) {
    echo json_encode(['status' => 'error', 'message' => 'Session expired. Please log in again.']);
    exit;
}

$firstName   = $_SESSION['firstName'] ?? 'User';
$phoneNumber = formatPhNumber( $_SESSION['phoneNumber']);
$userID      = $_SESSION['userID'];
$otpCode     = $_POST['otpCode'] ?? '';
$profilePhoto = $_SESSION['profilePhoto'] ?? '';

if (!$phoneNumber){
    echo json_encode(['status' => 'error', 'message' => 'Invalid Philippines Phone Number']);
    exit;
}

if (empty($otpCode)){
    $config = require 'config.php';
    $apiKey = $config['api_key'];
    $deviceId = $config['device_id'];
    $baseUrl = 'https://api.textbee.dev/api/v1';

    $sql = "SELECT timeCreated, TIMESTAMPDIFF(SECOND, timeCreated, NOW()) as seconds_ago 
            FROM Otp WHERE phoneNumber = :phoneNumber";
    $checkSpam = $pdo->prepare($sql);
    $checkSpam->execute([':phoneNumber' => $phoneNumber]);
    $lastOtp = $checkSpam->fetch(PDO::FETCH_ASSOC);

    if ($lastOtp && $lastOtp['seconds_ago'] < 50) { 
        echo json_encode([
            'status' => 'error', 
            'message' => 'Cooldown for '. $phoneNumber . '. Please wait ' . (50 - $lastOtp['seconds_ago']) . 's before requesting a new code.'
        ]);
        exit;
    }

    $otp_secure = random_int(100000, 999999);
    $sql = "INSERT INTO Otp (phoneNumber, code, status, timeCreated) 
            VALUES (:phone, :code, 'active', NOW()) 
            ON DUPLICATE KEY UPDATE code = VALUES(code), status = 'active', timeCreated = NOW()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':phone' => $phoneNumber, ':code' => $otp_secure]);

    $data = [
        'recipients' => [$phoneNumber],
        'message' => "Did you request to delete your account $firstName? To continue your, One-Time Password (OTP) is $otp_secure. Valid for 5 minutes."
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "$baseUrl/gateway/devices/$deviceId/send-sms",
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["x-api-key: $apiKey", "Content-Type: application/json"] 
    ]);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo json_encode(['status' => 'error', 'message' => 'SMS Gateway Error: ' . curl_error($ch)]);
    } else {    
        echo json_encode([
            'message' => 'OTP sent successfully! Please check your SMS. (' . $phoneNumber . ')',
            'gateway_response' => json_decode($response) 
        ]);        
    }
    curl_close($ch);
    exit;
}

$sql = "SELECT *, (NOW() > timeExpire) as isExpired 
            FROM Otp WHERE phoneNumber = :phoneNumber";
$stmt = $pdo->prepare($sql);
$stmt->execute([':phoneNumber' => $phoneNumber]);
$otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$otpRecord) {
    echo json_encode(['status' => 'error', 'message' => 'No OTP sent for this number.']);
    exit;
}
if ($otpRecord['status'] !== 'active') {
    echo json_encode(['status' => 'error', 'message' => 'OTP is no longer valid. Request a new one']);
    exit;
}
if ($otpRecord['isExpired'] == 1) {
    $pdo->prepare("UPDATE Otp SET status = 'expired' WHERE phoneNumber = :phoneNumber")->execute([':phoneNumber' => $phoneNumber]);
    echo json_encode(['status' => 'error', 'message' => 'OTP has expired. Request a new one']);
    exit;
}
if ($otpRecord['code'] != $otpCode) {
    echo json_encode(['status' => 'error', 'message' => 'Incorrect OTP code.']);
    exit;
}


if (!empty($profilePhoto) && file_exists($profilePhoto)) {
    @unlink($profilePhoto);
}

$pdo->prepare("DELETE FROM Otp WHERE phoneNumber = :phoneNumber")
    ->execute([':phoneNumber' => $phoneNumber]);

$delStmt = $pdo->prepare("DELETE FROM User WHERE userID = :userID");
$delStmt->execute([':userID' => $userID]);

echo json_encode(['success' => true, 'message' => 'Your account has been deleted ' . $firstName]);
session_destroy();
exit;
?>