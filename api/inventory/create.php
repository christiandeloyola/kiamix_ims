<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

require_once '../logs/audit.php';

$database = new Database();

$db = $database->connect();

$data = json_decode(
    file_get_contents("php://input")
);

$query = "

INSERT INTO inventory_items

(
    item_name,
    category,
    quantity,
    unit,
    unit_price,
    min_stock,
    supplier_id,
    description
)

VALUES

(
    :item_name,
    :category,
    :quantity,
    :unit,
    :unit_price,
    :min_stock,
    :supplier_id,
    :description
)

";

$stmt = $db->prepare($query);

$stmt->bindParam(
    ":item_name",
    $data->item_name
);

$stmt->bindParam(
    ":category",
    $data->category
);

$stmt->bindParam(
    ":quantity",
    $data->quantity
);

$stmt->bindParam(
    ":unit",
    $data->unit
);

$stmt->bindParam(
    ":unit_price",
    $data->unit_price
);

$stmt->bindParam(
    ":min_stock",
    $data->min_stock
);

$stmt->bindParam(
    ":supplier_id",
    $data->supplier_id,
    PDO::PARAM_INT
);

$stmt->bindParam(
    ":description",
    $data->description
);

if($stmt->execute()){

    try {

        logAction(
            $db,
            1,
            'CREATE',
            'INVENTORY',
            'Added inventory item: ' . $data->item_name
        );

    } catch(Exception $e) {

        error_log($e->getMessage());

    }

    echo json_encode([
        "success" => true,
        "message" => "Inventory item added"
    ]);

}else{

    echo json_encode([
        "success" => false
    ]);

}