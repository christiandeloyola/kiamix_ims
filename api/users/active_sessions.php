<?php
session_start();

header('Content-Type: application/json');

$response = [
    "success" => false,
    "data" => []
];

if (isset($_SESSION['user'])) {

    $response["success"] = true;

    $response["data"][] = [
        "username"   => $_SESSION['user']['username'],
        "fullname"   => $_SESSION['user']['fullname'],
        "role"       => $_SESSION['user']['role'],
        "login_time" => date('Y-m-d H:i:s')
    ];
}

echo json_encode($response);