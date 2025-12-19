<?php
session_start();

include_once 'index.php'; 
include_once 'getincidents.php';
include_once 'getuser.php';

header('Content-Type: application/json');

$types = array('Fire', 'Assault', 'Theft', 'Flooding', 'Suspicious Activity', 'Road Damage', 'Waste Management', 'Harassment', 'Other');

$incidentID = $_POST['incidentID'] ?? '';
$userID = $_SESSION['userID'] ?? '';

if (empty($incidentID) || empty($userID)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing Incident ID or you need to log in first.']);
    exit;
}

$checkSql = "SELECT userID, status FROM Incident WHERE incidentID = :id LIMIT 1";
$checkStmt = $pdo->prepare($checkSql);
$checkStmt->execute([':id' => $incidentID]);
$existingIncident = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (!$existingIncident) {
    echo json_encode(['status' => 'error', 'message' => 'Incident not found.']);
    exit;
}

if (($existingIncident['userID'] != $userID) && ($_SESSION['role'] ?? '') != 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: You can only edit your own reports.']);
    exit;
}
if (($existingIncident['status'] == 'deleted')){
    echo json_encode(['status' => 'error', 'message' => 'This incident is already deleted or archived. Create a new one with the same details if you insist']);
    exit;
}

$address = trim($_POST['address'] ?? '');
$latitude = (float)trim($_POST['latitude'] ?? '');
$longitude = (float)trim($_POST['longitude'] ?? '');    
$occurredAt = $_POST['occurredAt'] ?? '';
$description = $_POST['description'] ?? '';
$type = trim($_POST['type'] ?? '');
$uploadPhotoDir = '../public/images/incidents/'; 
$Photo = $_FILES["photo"] ?? null;

$errors = [];
if (!in_array($type, $types)) $errors[] = 'Invalid Incident Type selected.';
if (empty($address))   $errors[] = "Address is required.";
if (empty($latitude))    $errors[] = "Latitude is required.";
if (empty($longitude)) $errors[] = "Longitude is required.";
if (empty($occurredAt))    $errors[] = "Date and Time is required.";
if (empty($description))    $errors[] = "Description is required.";

if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}
if (!in_array($type, $types)) $errors[] = 'Invalid Incident Type selected.';
if (!validateMysqlTimestamp($occurredAt)) $errors[] = 'Invalid Time! ' . $occurredAt;
if (!empty($errors)) {
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit;
}

try {
    $sql = "UPDATE Incident SET 
            address = :address,
            latitude = :latitude,
            longitude = :longitude,
            occurredAt = :occurredAt,
            description = :description,
            type = :type";

    $params = [
        ':address' => $address,
        ':latitude' => $latitude,
        ':longitude' => $longitude,
        ':occurredAt' => $occurredAt,
        ':description' => $description,
        ':type' => $type,
        ':incidentID' => $incidentID,
        ':userID' => $userID
    ];

    if (isset($Photo) && $Photo['error'] === UPLOAD_ERR_OK) {
        
        $file_tmp_path = $Photo['tmp_name'];
        $allowed_image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        $file_mime_type = mime_content_type($file_tmp_path);

        if (!in_array($file_mime_type, $allowed_image_types)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only JPG, PNG, and GIF allowed.']);
            exit;
        }

        $PhotoUploaded = uploadPhoto($Photo, $uploadPhotoDir, $incidentID);
        
        if (!$PhotoUploaded) {
            throw new Exception("Photo upload failed");
        }

        $sql .= ", photo = :photo";
        $params[':photo'] = $PhotoUploaded;
    }

    if (($_SESSION['role'] ?? '') === 'admin') {
        $sql .= " WHERE incidentID = :incidentID";
        unset($params[':userID']); 
    } else {
        $sql .= " WHERE incidentID = :incidentID AND userID = :userID";
    }

    $stmt = $pdo->prepare($sql); 
    $stmt->execute($params);
    
    $updatedIncident = getincident($pdo, $incidentID);
    
    echo json_encode($updatedIncident, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>