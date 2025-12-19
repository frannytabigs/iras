<?php

include_once 'index.php';
include_once 'getuser.php';

header('Content-Type: application/json');

$password = $_POST['password'] ?? '';
$passwordHash = password_hash($password, PASSWORD_BCRYPT);
$phoneNumber = formatPhNumber(trim($_POST['phoneNumber'] ?? ''));
$otpCode     = $_POST['otpCode'] ?? null;



if ($otpCode){

    $sql = "SELECT *, (NOW() > timeExpire) as isExpired 
        FROM Otp WHERE phoneNumber = :phoneNumber";
$stmt = $pdo->prepare($sql);
$stmt->execute([':phoneNumber' => $phoneNumber]);
$otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$otpRecord) {
    echo json_encode(['status' => 'error', 'message' => 'No OTP sent for this number (' . $phoneNumber .'). Perhaps you forgot to tap send?']);
    exit;
}

if ($otpRecord['status'] !== 'active') {
    echo json_encode(['status' => 'error', 'message' => 'This OTP is no longer valid. Request a new one']);
    exit;
}

if ($otpRecord['isExpired'] == 1) {
    $pdo->prepare("UPDATE Otp SET status = 'expired' WHERE phoneNumber = :phoneNumber")
        ->execute([':phoneNumber' => $phoneNumber]);
    echo json_encode(['status' => 'error', 'message' => 'OTP has expired. Request a new one']);
    exit;
}

if ($otpRecord['code'] != $otpCode) {
    echo json_encode(['status' => 'error', 'message' => 'Incorrect OTP code.']);
    exit;
}
if (empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Password cannot be empty.']);
        exit;
}
$pdo->prepare("UPDATE Otp SET status = 'used' WHERE phoneNumber = :phoneNumber")
    ->execute([':phoneNumber' => $phoneNumber]);

$sql = "UPDATE User 
        SET passwordHash = :passwordHash 
        WHERE phoneNumber = :phoneNumber";


$stmt = $pdo->prepare($sql);
$stmt->bindParam(':passwordHash', $passwordHash);
$stmt->bindParam(':phoneNumber', $phoneNumber);
$stmt->execute();
echo json_encode(['success' => true, 'message' => 'Password updated successfully!']);
       
exit;


}


$config = require 'config.php';
$apiKey = $config['api_key'];
$deviceId = $config['device_id'];
$baseUrl = 'https://api.textbee.dev/api/v1';
if (!$phoneNumber){
    echo json_encode(['status' => 'error', 'message' => 'Invalid Philippines Phone Number']);
    exit;
}

$checkUser = $pdo->prepare("SELECT phoneNumber FROM User WHERE phoneNumber = :phoneNumber");
$checkUser->execute([':phoneNumber' => $phoneNumber]);
if (!$checkUser->fetch()) {
    echo json_encode(['status' => 'error', 'message' => 'This phone number is not registered to an account.']);
    exit;
}

$sql = "SELECT 
        timeCreated, 
        TIMESTAMPDIFF(SECOND, timeCreated, NOW()) as seconds_ago 
        FROM Otp 
        WHERE phoneNumber = :phoneNumber";

$checkSpam = $pdo->prepare($sql);
$checkSpam->execute([':phoneNumber' => $phoneNumber]);
$lastOtp = $checkSpam->fetch(PDO::FETCH_ASSOC);

if ($lastOtp) {
    if ($lastOtp['seconds_ago'] < 50) { 
        echo json_encode([
            'status' => 'error', 
            'message' => 'Cooldown for ' . $phoneNumber . '. Please wait ' . (50 - $lastOtp['seconds_ago']) . ' seconds before requesting a new code.'
        ]);
        exit;
    }
}

$otp_secure = random_int(100000, 999999);

$sql = "INSERT INTO Otp (phoneNumber, code, status, timeCreated) 
        VALUES (:phone, :code, 'active', NOW()) 
        ON DUPLICATE KEY UPDATE 
            code = VALUES(code), 
            status = 'active', 
            timeCreated = NOW()";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':phone' => $phoneNumber,
    ':code' => $otp_secure
]);

$data = [
    'recipients' => [$phoneNumber],
    'message' => "To reset your password in IRAS, your One-Time Password (OTP) is $otp_secure. Valid for 5 minutes."
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "$baseUrl/gateway/devices/$deviceId/send-sms",
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "x-api-key: $apiKey",
        "Content-Type: application/json" 
]]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['status' => 'error', 'message' => 'SMS Gateway Error: ' . curl_error($ch)]);
} else {    
    echo json_encode([
        'message' => 'OTP sent successfully! Please check your SMS. ('.$phoneNumber.')',
        'gateway_response' => json_decode($response) 
    ]);        
}

curl_close($ch);


?>