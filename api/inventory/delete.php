<?php

session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit();
}

if ($_SESSION['role'] !== 'Administrator') {

    echo json_encode([
        "success" => false,
        "message" => "Only Administrators can delete inventory"
    ]);

    exit();
}

include_once "../../config/database.php";
require_once "../logs/audit.php";

$database = new Database();
$db = $database->connect();

if(!isset($_GET['id'])){

    echo json_encode([
        "success" => false,
        "message" => "Item ID required"
    ]);

    exit;
}

$id = intval($_GET['id']);

$query = "
DELETE FROM inventory_items
WHERE id = :id
";

$stmt = $db->prepare($query);

$stmt->bindParam(":id", $id, PDO::PARAM_INT);

if($stmt->execute()){

    logAction(
        $db,
        $_SESSION['user_id'],
        'DELETE',
        'INVENTORY',
        'Deleted inventory item ID: ' . $id
    );

    echo json_encode([
        "success" => true,
        "message" => "Inventory item deleted"
    ]);

}else{

    echo json_encode([
        "success" => false,
        "message" => "Delete failed"
    ]);
}