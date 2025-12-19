<?php
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    die('Access denied');
}
return [
    'api_key' => 'YOUR_TEXTBEE_API_KEY',
    'device_id' => 'YOUR_TEXTBEE_DEVICE_ID',
    'base_url' => 'https://api.textbee.dev/api/v1',
    'mapapikey' => 'YOUR_LOCATIONIQ_API_KEY'
];
?>