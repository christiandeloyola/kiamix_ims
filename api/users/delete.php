<?php

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);

    exit;
}

if ($_SESSION['role'] !== 'Administrator') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Administrator access required'
    ]);

    exit;
}

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

if ($_SESSION['user_id'] == $data['id']) {

    echo json_encode([
        'success' => false,
        'message' => 'You cannot delete your own account'
    ]);

    exit;
}

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