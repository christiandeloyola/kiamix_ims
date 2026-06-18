<?php

session_start();

header('Content-Type: application/json');

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);

    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$currentUserId =
    $_SESSION['user_id'];

$currentRole =
    strtolower(
        trim($_SESSION['role'])
    );

$targetUserId =
    intval($data['id']);

$isAdministrator =
    $currentRole === 'administrator';

$isOwnAccount =
    $currentUserId === $targetUserId;

if (!$isAdministrator && !$isOwnAccount) {

    echo json_encode([
        'success' => false,
        'message' => 'You are not allowed to edit this user.'
    ]);

    exit;
}

try {

    if (!empty($data['password'])) {

        $hashedPassword = password_hash(
            $data['password'],
            PASSWORD_DEFAULT
        );

        $stmt = $pdo->prepare("
            UPDATE users
            SET
                fullname = :fullname,
                email = :email,
                role = :role,
                password = :password
            WHERE id = :id
        ");

        $stmt->execute([
            ':fullname' => $data['fullname'],
            ':email' => $data['email'],
            ':role' => $data['role'],
            ':password' => $hashedPassword,
            ':id' => $data['id']
        ]);

    } else {

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

    }

    echo json_encode([
        'success' => true
    ]);

} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

}