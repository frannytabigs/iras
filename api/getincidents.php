<?php

include_once 'index.php';
header('Content-Type: application/json');

$startTimeInput = $_GET['start_time'] ?? null;
$endTimeInput = $_GET['end_time'] ?? null;
$id = $_GET['id'] ?? null;
$location = $_GET['location'] ?? null;
$type = $_GET['type'] ?? null;
$phoneNumber = $_GET['phoneNumber'] ?? null;


function getincident(PDO $pdo, $id = null, $location = null, $type = null, $startTimeInput = null, $endTimeInput = null, $phoneNumber = null): array 
{
  $sql = "SELECT 
                Incident.incidentID, 
                Incident.photo, 
                Incident.address, 
                Incident.latitude, 
                Incident.longitude, 
                Incident.occurredAt, 
                Incident.description, 
                Incident.type,
                Incident.status,
                User.firstName,
                User.profilePhoto,
                User.phoneNumber
            FROM Incident
            LEFT JOIN User ON Incident.userID = User.userID";
$whereClauses = [];
$params = [];



    if (!empty($id)) {
        $whereClauses[] = "Incident.incidentID = :id";
        $params[':id'] = $id;

    } 
    else {
       
    if (!empty($phoneNumber)) {
         if ($phoneNumber == "deleted"){
        $whereClauses[] = "Incident.userID IS NULL";
    }else{
        $whereClauses[] = "User.phoneNumber = :incidentUserPhoneNumber";
        $params[':incidentUserPhoneNumber'] = $phoneNumber;}
    }
    

    if (!empty($type)) {
        $whereClauses[] = "Incident.type = :type";
        $params[':type'] = $type;
    }

  

    if (!empty($location)) {
        $locationPattern = str_replace(' ', '|', preg_quote($location));
        $whereClauses[] = "address REGEXP :locationPattern";
        $params[':locationPattern'] = $locationPattern;
    }

    if ($startTimeInput !== null && $endTimeInput !== null) {
        $whereClauses[] = "occurredAt BETWEEN :startTime AND :endTime";
        $params[':startTime'] = $startTimeInput;
        $params[':endTime'] = $endTimeInput;
    }
}

if (count($whereClauses) > 0) {
    $sql .= " WHERE " . implode(' AND ', $whereClauses);
}

    $sql .= " ORDER BY Incident.occurredAt DESC";
    $stmt = $pdo->prepare($sql);

    foreach ($params as $key => &$value) {
        if ($key === ':id') {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    $stmt->execute();
   $incidents = $stmt->fetchAll(PDO::FETCH_ASSOC);
   return $incidents;
}  
    http_response_code(200);
    
    if (isset($_GET["show"])) {
    $incidents = getincident($pdo, $id, $location, $type, $startTimeInput, $endTimeInput,$phoneNumber);

    if (count($incidents) > 0) {
        echo json_encode($incidents, JSON_PRETTY_PRINT);
    } else {
        echo json_encode(["message" => "No incidents found matching the criteria."], JSON_PRETTY_PRINT);
    }
}


?>