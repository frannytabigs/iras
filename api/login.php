<?php
session_start();
include_once 'index.php';
include_once 'getuser.php';
 


header('Content-Type: application/json');

$phoneNumber = formatPhNumber(trim($_POST['phoneNumber'] ?? ''));
$password = $_POST['password'] ?? '';

if ($_POST['phoneNumber'] == 'IRAS') $phoneNumber = "IRAS";
$sql = "SELECT userID, phoneNumber, passwordHash, firstName, profilePhoto, role FROM User WHERE phoneNumber = :phoneNumber LIMIT 1";

$stmt = $pdo->prepare($sql);
$stmt->bindParam(':phoneNumber', $phoneNumber);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);


if (password_verify($password,$user['passwordHash'])){
    unset($user['passwordHash']);

       
   
    session_regenerate_id(true);
    $_SESSION["userID"] = ucwords($user['userID']);
    $_SESSION["phoneNumber"] = $user['phoneNumber'];
    $_SESSION["firstName"] = ucwords($user['firstName']);
    $_SESSION["profilePhoto"] = $user['profilePhoto'];
    $_SESSION['role'] = $user['role'];

     echo json_encode([
        'success' => true, 
        'user' => $user,
    ], JSON_PRETTY_PRINT);
   
    return;
}

echo json_encode(['message'=> 'invalid credentials','user'=> $phoneNumber],JSON_PRETTY_PRINT);

?>