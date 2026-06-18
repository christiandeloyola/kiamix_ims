<?php

session_start();

header('Content-Type: application/json');

if(!isset($_SESSION['user_id'])){

    echo json_encode([
        'success' => false
    ]);

    exit;
}

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'fullname' => $_SESSION['fullname'],
        'role' => $_SESSION['role']
    ]
]);