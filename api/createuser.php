<?php

include_once 'index.php'; 
include_once 'getuser.php';

header('Content-Type: application/json');

$firstName   = trim(ucwords($_POST['firstName'] ?? ''));
$lastName    = trim(ucwords($_POST['lastName'] ?? ''));
$phoneNumber = trim($_POST['phoneNumber'] ?? '');
$password    = $_POST['password'] ?? '';
$birthday    = $_POST['birthday'] ?? '';
$otpCode     = $_POST['otpCode'] ?? '';

$middleName  = trim(ucwords($_POST['middleName'] ?? ''));
$suffix      = trim(ucwords($_POST['suffix'] ?? ''));
//$role        = trim($_POST['role'] ?? 'user');
$role = 'user';

$uploadprofilePhoto = '../public/images/profilePhoto/'; 
$profilePhoto = $_FILES["profilePhoto"] ?? null;

$errors = [];

if (empty($firstName))   $errors[] = "First Name is required.";
if (empty($lastName))    $errors[] = "Last Name is required.";
if (empty($phoneNumber)) $errors[] = "Phone Number is required.";
if (empty($password))    $errors[] = "Password is required.";
if (empty($birthday))    $errors[] = "Birthday is required.";
if (empty($otpCode))     $errors[] = "OTP Code is required.";

if (!isset($profilePhoto) || $profilePhoto['error'] !== UPLOAD_ERR_OK) {
    $errors[] = "Profile Photo is required.";
}

if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}

$file_tmp_path = $profilePhoto['tmp_name'];
$allowed_image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
$file_mime_type = mime_content_type($file_tmp_path);

if (!in_array($file_mime_type, $allowed_image_types)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPG, PNG, and GIF are allowed.']);
    exit;
}

$oldp = $phoneNumber;
$phoneNumber = formatPhNumber($phoneNumber);

$sql = "SELECT *, (NOW() > timeExpire) as isExpired 
        FROM Otp WHERE phoneNumber = :phoneNumber";
$stmt = $pdo->prepare($sql);
$stmt->execute([':phoneNumber' => $phoneNumber]);
$otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$otpRecord) {
    echo json_encode(['status' => 'error', 'message' => 'No OTP sent for this number ('.$oldp.'). Perhaps you forgot to tap send?']);
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


$pdo->prepare("UPDATE Otp SET status = 'used' WHERE phoneNumber = :phoneNumber")
    ->execute([':phoneNumber' => $phoneNumber]);



$profilePhotoUploaded = uploadPhoto($profilePhoto, $uploadprofilePhoto, $phoneNumber);

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

$sql = "INSERT INTO User 
        (phoneNumber, firstName, middleName, lastName, suffix, birthday, passwordHash, profilePhoto, role) 
        VALUES 
        (:phoneNumber, :firstName, :middleName, :lastName, :suffix, :birthday, :passwordHash, :profilePhoto, :role)";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':firstName', $firstName); 
$stmt->bindValue(':middleName', $middleName);
$stmt->bindValue(':lastName', $lastName);           
$stmt->bindValue(':suffix', $suffix);        
$stmt->bindValue(':phoneNumber', $phoneNumber);
$stmt->bindValue(':passwordHash', $passwordHash);
$stmt->bindValue(':role', $role);             
$stmt->bindValue(':birthday', $birthday);
$stmt->bindValue(':profilePhoto', $profilePhotoUploaded); 

try {
    $stmt->execute();
    $user = getuser($pdo, "", $pdo->lastInsertId());
    echo json_encode($user, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'This phone number is already registered.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

?>