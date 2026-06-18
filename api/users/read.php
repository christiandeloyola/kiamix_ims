<?php

header('Content-Type: application/json');

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

try {

    $stmt = $pdo->query("
        SELECT
            id,
            fullname,
            username,
            email,
            role,
            created_at
        FROM users
        ORDER BY id DESC
    ");

    echo json_encode([
        'success' => true,
        'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch(Exception $e){

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}