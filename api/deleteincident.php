<?php
session_start();

include_once 'index.php'; 
include_once 'getincidents.php';

header('Content-Type: application/json');

$incidentID = $_POST['incidentID'] ?? '';
$userID = $_SESSION['userID'] ?? '';

if (empty($incidentID) || empty($userID)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing Incident ID or you need to log in first.']);
    exit;
}

$checkSql = "SELECT userID FROM Incident WHERE incidentID = :id LIMIT 1";
$checkStmt = $pdo->prepare($checkSql);
$checkStmt->execute([':id' => $incidentID]);
$existingIncident = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (!$existingIncident) {
    echo json_encode(['status' => 'error', 'message' => 'Incident not found.']);
    exit;
}

if (($existingIncident['userID'] != $userID) && ($_SESSION['role'] ?? '') != 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: You can only delete your own reports.']);
    exit;
}

try {
    $sql = "UPDATE Incident SET status = :status WHERE incidentID = :incidentID";

    $params = [
        ':status' => "deleted",
        ':incidentID' => $incidentID 
    ];
    
    $stmt = $pdo->prepare($sql); 
    $stmt->execute($params);
    
    echo json_encode([
        'message' => 'Incident deleted successfully'
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>