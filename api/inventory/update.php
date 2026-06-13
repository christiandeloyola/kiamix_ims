<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$data = json_decode(
    file_get_contents("php://input")
);

if(empty($data->id)){
    echo json_encode([
        "success" => false,
        "message" => "Item ID required"
    ]);
    exit;
}

$query = "

UPDATE inventory_items
SET

    item_name = :item_name,
    category = :category,
    quantity = :quantity,
    unit = :unit,
    unit_price = :unit_price,
    min_stock = :min_stock,
    supplier_id = :supplier_id,
    description = :description

WHERE id = :id

";

$stmt = $db->prepare($query);

$stmt->bindParam(":id",$data->id,PDO::PARAM_INT);
$stmt->bindParam(":item_name",$data->item_name);
$stmt->bindParam(":category",$data->category);
$stmt->bindParam(":quantity",$data->quantity);
$stmt->bindParam(":unit",$data->unit);
$stmt->bindParam(":unit_price",$data->unit_price);
$stmt->bindParam(":min_stock",$data->min_stock);
$stmt->bindParam(":supplier_id",$data->supplier_id,PDO::PARAM_INT);
$stmt->bindParam(":description",$data->description);

if($stmt->execute()){

    echo json_encode([
        "success" => true,
        "message" => "Item updated successfully"
    ]);

}else{

    echo json_encode([
        "success" => false,
        "message" => "Update failed"
    ]);

}