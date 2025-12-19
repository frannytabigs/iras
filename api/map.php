<?php
header('Content-Type: application/json');

$config = require 'config.php'; 
$apiKey = $config['mapapikey'];

$isReverse = !empty($_POST['reverse'] ?? ''); 

if ($isReverse) {
    $lat = $_POST['lat'] ?? '';
    $lon = $_POST['lon'] ?? '';

    if (empty($lat) || empty($lon)){
        echo json_encode(['status' => 'error', 'message' => 'Missing lat/lon parameters']);
        exit;
    }

    $url = "https://us1.locationiq.com/v1/reverse.php?key=$apiKey&lat=$lat&lon=$lon&format=json";

} else {
    $query = $_POST['q'] ?? '';

    if (strlen($query) < 3) {
        echo json_encode([]); 
        exit;
    }

    $url = "https://api.locationiq.com/v1/autocomplete?key=$apiKey&q=" . urlencode($query) . "&limit=5&format=json";
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
} else {
    if ($isReverse) {
        $data = json_decode($response, true);
        
        if (isset($data['error'])) {
             echo json_encode(['status' => 'error', 'message' => $data['error']]);
        } else {
             echo json_encode([
                'status' => 'success', 
                'address' => [
                    'display_name' => $data['display_name'] 
                ]
            ]);        
        }
    } else {
        echo $response; 
    }
}
curl_close($ch);
?>