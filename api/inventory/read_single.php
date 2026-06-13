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

SELECT
    *
FROM inventory_items
WHERE id = :id
LIMIT 1

";

$stmt = $db->prepare($query);

$stmt->bindParam(
    ":id",
    $id,
    PDO::PARAM_INT
);

$stmt->execute();

if($stmt->rowCount() > 0){

    $item = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    echo json_encode($item);

}else{

    echo json_encode([
        "success" => false,
        "message" => "Item not found"
    ]);

}