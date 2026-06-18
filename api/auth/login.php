<?php

session_start();

header('Content-Type: application/json');

require_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['username']) ||
    empty($data['password']) ||
    empty($data['role'])
) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

$database = new Database();
$pdo = $database->connect();

$stmt = $pdo->prepare("
    SELECT *
    FROM users
    WHERE username = :username
    AND role = :role
");

$stmt->execute([
    ':username' => $data['username'],
    ':role'     => $data['role']
]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if(!$user){
    echo json_encode([
        'success' => false,
        'message' => 'User not found'
    ]);
    exit;
}

if(
    !password_verify(
        $data['password'],
        $user['password']
    )
){

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