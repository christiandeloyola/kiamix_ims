<?php

header('Content-Type: application/json');

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

try {

    $stmt = $pdo->prepare("
        UPDATE users
        SET
            fullname = :fullname,
            email = :email,
            role = :role
        WHERE id = :id
    ");

    $stmt->execute([
        ':fullname' => $data['fullname'],
        ':email' => $data['email'],
        ':role' => $data['role'],
        ':id' => $data['id']
    ]);

    echo json_encode([
        'success' => true
    ]);

} catch(Exception $e){

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}