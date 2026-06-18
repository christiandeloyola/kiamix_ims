<?php

session_start();

header('Content-Type: application/json');

require_once '../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

$database = new Database();
$pdo = $database->connect();

$stmt = $pdo->prepare("
    SELECT *
    FROM users
    WHERE username = :username
");

$stmt->execute([
    ':username' => $data['username']
]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$user){
    echo json_encode([
        'success' => false,
        'message' => 'User not found'
    ]);
    exit;
}

if($user['password'] !== $data['password']){
    echo json_encode([
        'success' => false,
        'message' => 'Invalid password'
    ]);
    exit;
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['fullname'] = $user['fullname'];
$_SESSION['role'] = $user['role'];

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'fullname' => $user['fullname'],
        'role' => $user['role']
    ]
]);