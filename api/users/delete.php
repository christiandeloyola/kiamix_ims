<?php

header('Content-Type: application/json');

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

try {

    $stmt = $pdo->prepare("
        DELETE FROM users
        WHERE id = ?
    ");

    $stmt->execute([
        $data['id']
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