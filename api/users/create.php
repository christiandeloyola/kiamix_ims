<?php

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);

    exit();
}

if ($_SESSION['role'] !== 'Administrator') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Administrator access required'
    ]);

    exit();
}

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

try {

    $stmt = $pdo->prepare("
        INSERT INTO users
        (
            fullname,
            username,
            email,
            password,
            role
        )
        VALUES
        (
            :fullname,
            :username,
            :email,
            :password,
            :role
        )
    ");

    $stmt->execute([
        ':fullname' => $data['fullname'],
        ':username' => $data['username'],
        ':email' => $data['email'],
        ':password' => password_hash(
            $data['password'],
            PASSWORD_DEFAULT
        ),
        ':role' => $data['role']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'User created successfully'
    ]);

} catch(Exception $e){

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}