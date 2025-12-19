<?php

include_once 'index.php'; 
include_once 'getuser.php';

header('Content-Type: application/json');

$config = require 'config.php';
$apiKey = $config['api_key'];
$deviceId = $config['device_id'];
$baseUrl = 'https://api.textbee.dev/api/v1';

$phoneNumber = formatPhNumber(trim($_POST['phoneNumber'] ?? ''));



if (!$phoneNumber){
    echo json_encode(['status' => 'error', 'message' => 'Invalid Philippines Phone Number']);
    exit;
}

$checkUser = $pdo->prepare("SELECT phoneNumber FROM User WHERE phoneNumber = :phoneNumber");
$checkUser->execute([':phoneNumber' => $phoneNumber]);
if ($checkUser->fetch()) {
    echo json_encode(['status' => 'error', 'message' => 'This phone number is already registered to an account. Go to log in']);
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
            'message' => 'Cooldown for ' .$phoneNumber . '. Please wait ' . (50 - $lastOtp['seconds_ago']) . ' seconds before requesting a new code.'
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
    'message' => "Welcome to IRAS! Your One-Time Password (OTP) is $otp_secure. Valid for 5 minutes."
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