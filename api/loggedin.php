<?php

session_start();
header('Content-Type: application/json');

if (isset($_GET['logout'])){
  session_unset();
  session_destroy();
  echo json_encode(['status' => 'logout']);
}

elseif (isset($_SESSION['userID'])) {
    echo json_encode([
        'status' => 'logged_in',
        'user' => [
          'userID' =>  $_SESSION['userID'],
          'phoneNumber' =>  $_SESSION['phoneNumber'],
          'firstName' =>   $_SESSION['firstName'],
        'profilePhoto' => $_SESSION['profilePhoto'],
           'role' =>   $_SESSION['role']
        ]
    ]);
}

else {
  echo json_encode(['status' => 'guest']);
}
?>  