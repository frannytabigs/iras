<?php
session_start();

include_once 'index.php';
include_once 'getuser.php';

header('Content-Type: application/json');

$phoneNumber = trim($_POST['phoneNumber'] ?? '');

if ($phoneNumber == ''){
    echo json_encode(['status' => 'error', 'message' => 'Missing phone number.']);
    exit;
}
$phoneNumber = formatPhNumber($phoneNumber);
if (!$phoneNumber){
    echo json_encode(['status' => 'error', 'message' => 'Invalid Philippines Phone Number']);
    exit;
}

if (isset($_POST['otponly'])){
    $config = require 'config.php';
    $apiKey = $config['api_key'];
    $deviceId = $config['device_id'];
    $baseUrl = 'https://api.textbee.dev/api/v1';

    $checkUser = $pdo->prepare("SELECT userID FROM User WHERE phoneNumber = :phoneNumber");
    $checkUser->execute([':phoneNumber' => $phoneNumber]);
    $existing = $checkUser->fetch();

    if ($existing && $existing['userID'] != $_SESSION['userID']) {
        echo json_encode(['status' => 'error', 'message' => 'This phone number is already registered to another account.']);
        exit;
    }

    $sql = "SELECT timeCreated, TIMESTAMPDIFF(SECOND, timeCreated, NOW()) as seconds_ago 
            FROM Otp WHERE phoneNumber = :phoneNumber";
    $checkSpam = $pdo->prepare($sql);
    $checkSpam->execute([':phoneNumber' => $phoneNumber]);
    $lastOtp = $checkSpam->fetch(PDO::FETCH_ASSOC);

    if ($lastOtp && $lastOtp['seconds_ago'] < 50) { 
        echo json_encode([
            'status' => 'error', 
            'message' => 'Cooldown for '. $phoneNumber . '. Please wait ' . (50 - $lastOtp['seconds_ago']) . 's before requesting new code.'
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
        'message' => "To change your account details in IRAS, your One-Time Password (OTP) is $otp_secure. Valid for 5 minutes."
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


$firstName   = trim(ucwords($_POST['firstName'] ?? ''));
$lastName    = trim(ucwords($_POST['lastName'] ?? ''));
$middleName  = trim(ucwords($_POST['middleName'] ?? ''));
$suffix      = trim(ucwords($_POST['suffix'] ?? ''));
//$role        = trim($_POST['role'] ?? 'user');
$role        = 'user';
$currentSessionPhone = $_SESSION['phoneNumber']; 
$birthday    = $_POST['birthday'] ?? '';
$password    = $_POST['newpass'] ?? ''; 
$otpCode     = $_POST['otpCode'] ?? '';

$userID = $_SESSION['userID'];
$oldPhotoDbPath = $_SESSION['profilePhoto']; 

$targetDir = '../public/images/profilePhoto/'; 
$profilePhotoInput = $_FILES["profilePhoto"] ?? null;

$errors = [];
if (empty($firstName))   $errors[] = "First Name is required.";
if (empty($lastName))    $errors[] = "Last Name is required.";
if (empty($phoneNumber)) $errors[] = "Phone Number is required.";
if (empty($birthday))    $errors[] = "Birthday is required.";

if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}

if (empty($otpCode)) {
    echo json_encode(['status' => 'error', 'message' => 'OTP Code is required to save changes.']);
    exit;
}

if ($otpCode) {

    $sql = "SELECT *, (NOW() > timeExpire) as isExpired 
            FROM Otp WHERE phoneNumber = :phoneNumber";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':phoneNumber' => $phoneNumber]);
    $otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$otpRecord) {
        echo json_encode(['status' => 'error', 'message' => 'No OTP sent for this number (' . $phoneNumber . '). Perhaps you forgot to tap send?']);
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

    $finalPhotoPath = $oldPhotoDbPath; 

     if ($currentSessionPhone != $phoneNumber) {
            $pdo->prepare("DELETE FROM Otp WHERE phoneNumber = :oldPhone")
                ->execute([':oldPhone' => $currentSessionPhone]);
        $filename = $_SESSION['profilePhoto'];
        $folder = dirname($filename); 
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $newName = $phoneNumber; 
        $newPath = $folder . '/' . $newName . '.' . $extension;
        if (file_exists($filename)) {
            rename($filename, $newPath);
            $finalPhotoPath = $newPath;
        }  

     }
    if (isset($profilePhotoInput) && $profilePhotoInput['error'] === UPLOAD_ERR_OK && is_uploaded_file($profilePhotoInput['tmp_name'])) {
        
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        $file_mime = mime_content_type($profilePhotoInput['tmp_name']);

        if (!in_array($file_mime, $allowed_types)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPG, PNG, and GIF are allowed.']);
            exit;
        }

        @unlink($oldPhotoDbPath);
        $finalPhotoPath = uploadPhoto($profilePhotoInput,$targetDir,$phoneNumber);

       
    }
    
    $sql = "UPDATE User SET 
            firstName = :firstName,
            middleName = :middleName,
            lastName = :lastName,
            suffix = :suffix,
            birthday = :birthday,
            profilePhoto = :profilePhoto, 
            phoneNumber = :phoneNumber, 
            role = :role";

    $params = [
        ':firstName' => $firstName,
        ':middleName' => $middleName,
        ':lastName' => $lastName,
        ':suffix' => $suffix,
        ':birthday' => $birthday,
        ':profilePhoto' => $finalPhotoPath, 
        ':phoneNumber' => $phoneNumber,     
        ':role' => $role,
        ':userID' => $userID
    ];

    if (!empty($password)) {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $sql .= ", passwordHash = :passwordHash";
        $params[':passwordHash'] = $passwordHash;
    }

    $sql .= " WHERE userID = :userID";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $pdo->prepare("UPDATE Otp SET status = 'used' WHERE phoneNumber = :phoneNumber")
            ->execute([':phoneNumber' => $phoneNumber]);
            
       
            
        $_SESSION['profilePhoto'] = $finalPhotoPath;
        $_SESSION['phoneNumber'] = $phoneNumber;
        $_SESSION['firstName'] = $firstName;

        echo json_encode(['status' => 'success', 'message' => 'Account updated successfully!','phoneNumber'=>$phoneNumber]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }

    exit;
}
?>