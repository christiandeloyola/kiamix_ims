<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

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