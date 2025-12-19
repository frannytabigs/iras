<?php
session_start();

include_once 'index.php'; 
include_once 'getincidents.php';
include_once 'getuser.php';

header('Content-Type: application/json');

$types = array('Fire', 'Assault', 'Theft', 'Flooding', 'Suspicious Activity', 'Road Damage', 'Waste Management', 'Harassment', 'Other');

$address = trim($_POST['address'] ?? '');
$latitude = (float)trim($_POST['latitude'] ?? '');
$longitude = (float)trim($_POST['longitude'] ?? '');    
$occurredAt = $_POST['occurredAt'] ?? '';
$description = $_POST['description'] ?? '';
$type = trim($_POST['type'] ?? '');
$userID = $_SESSION['userID'] ?? '';

$uploadPhotoDir = '../public/images/incidents/'; 
$Photo = $_FILES["photo"] ?? null;

$errors = [];


if (empty($address))   $errors[] = "Address is required.";
if (empty($latitude))    $errors[] = "Latitude is required.";
if (empty($longitude)) $errors[] = "Longitude is required.";
if (empty($occurredAt))    $errors[] = "Date and Time is required.";
if (empty($description))    $errors[] = "Description is required.";
if (empty($userID)) $errors[] = "You need to Log-in first."; 


if (!isset($Photo) || $Photo['error'] !== UPLOAD_ERR_OK) {
    $errors[] = "Incident Photo is required.";
}

if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}
if (!in_array($type, $types)) $errors[] = 'Invalid Incident Type selected.';
if (!validateMysqlTimestamp($occurredAt)) $errors[] = 'Invalid Time! '. $occurredAt;
if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}

$file_tmp_path = $Photo['tmp_name'];
$allowed_image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
$file_mime_type = mime_content_type($file_tmp_path);

if (!in_array($file_mime_type, $allowed_image_types)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPG, PNG, and GIF allowed.']);
    exit;
}

try {
    $sql = "INSERT INTO Incident (address, latitude, longitude, occurredAt, description, type, userID)
            VALUES (:address, :latitude, :longitude, :occurredAt, :description, :type, :userID)";   

    $stmt = $pdo->prepare($sql); 
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':latitude', $latitude);
    $stmt->bindParam(':longitude', $longitude);
    $stmt->bindParam(':occurredAt', $occurredAt);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':userID', $userID);
    $stmt->execute();
    
    $newID = $pdo->lastInsertId();

    $PhotoUploaded = uploadPhoto($Photo, $uploadPhotoDir, $newID); 

    if (!$PhotoUploaded) {
        throw new Exception("Photo upload failed");
    }

    $updateSQL = "UPDATE Incident SET photo = :photo WHERE incidentID = :id";
    $updateStmt = $pdo->prepare($updateSQL);
    $updateStmt->execute([':photo' => $PhotoUploaded, ':id' => $newID]);

    $incident = getincident($pdo, $newID);
    
    echo json_encode( $incident, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>