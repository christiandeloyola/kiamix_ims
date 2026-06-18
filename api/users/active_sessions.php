<?php
session_start();

header('Content-Type: application/json');

$response = [
    "success" => false,
    "data" => []
];

if (
    isset($_SESSION['user_id']) &&
    isset($_SESSION['username'])
) {

    $response['success'] = true;

    $response['data'][] = [
        "username" => $_SESSION['username'],
        "fullname" => $_SESSION['fullname'],
        "role" => $_SESSION['role'],
        "login_time" => date('Y-m-d H:i:s')
    ];
}

echo json_encode($response);