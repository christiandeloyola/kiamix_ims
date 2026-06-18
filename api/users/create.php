<?php

header('Content-Type: application/json');

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
        ':password' => $data['password'],
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