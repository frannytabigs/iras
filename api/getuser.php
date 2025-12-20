<?php

include_once 'index.php';
header('Content-Type: application/json');

function validateMysqlTimestamp($dateString) {
    $format = 'Y-m-d H:i:s';
    $d = DateTime::createFromFormat($format, $dateString);
    if ($d && $d->format($format) === $dateString) return true;

    $format = 'Y-m-d H:i';
    $d = DateTime::createFromFormat($format, $dateString);
    return $d && $d->format($format) === $dateString;
}
function formatPhNumber($number) {
    $clean = preg_replace('/[^0-9]/', '', $number);
    if (strlen($clean) == 11 && substr($clean, 0, 2) == '09') {
        $clean = '63' . substr($clean, 1);
    } elseif (strlen($clean) == 10 && substr($clean, 0, 1) == '9') {
        $clean = '63' . $clean;
    }
    if (substr($clean, 0, 3) == '639' && strlen($clean) == 12) {
        return '+' . $clean;
    }
    return false;
}

function getuser(PDO $pdo, $phoneNumber = "", $userID = null): ?array {
    $sql = "SELECT userID, phoneNumber, firstName, middleName, lastName, suffix, birthday, age, profilePhoto, role, creation 
            FROM User";
    
    $whereClause = "";
    $params = [];
    if (!empty($userID)) {
        $whereClause = " WHERE userID = :userID";
        $params[':userID'] = $userID;
    } elseif (!empty($phoneNumber)) {
        $whereClause = " WHERE phoneNumber = :phoneNumber";
        $params[':phoneNumber'] = $phoneNumber;
    }
    
    $sql .= $whereClause;

    if (empty($whereClause)) {
        return null;
    }

    $stmt = $pdo->prepare($sql);

    if (isset($params[':userID'])) {
        $stmt->bindParam(':userID', $params[':userID'], PDO::PARAM_INT);
    } elseif (isset($params[':phoneNumber'])) {
        $stmt->bindParam(':phoneNumber', $params[':phoneNumber']);
    }
    
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $user ?: null; 
}

function uploadPhoto($file, $upload_dir, $phoneNumber) {

    $mime = mime_content_type($file['tmp_name']);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif'
    ];
    $fileExtension = $extensions[$mime] ?? 'jpg';
    $newFileName = $phoneNumber . '.' . $fileExtension;
    $destination = $upload_dir . $newFileName;
    $saved = move_uploaded_file($file['tmp_name'], $destination);
    if ($saved) {
        return $destination;
    }

}

http_response_code(200);


if (isset($_GET["show"])) {
    $user = getuser($pdo, $_GET['phoneNumber'] ?? null, null);
    if ($user) {echo json_encode($user,JSON_PRETTY_PRINT);}
    else {echo json_encode(["message" => "User not found."],JSON_PRETTY_PRINT);}
}




?>
