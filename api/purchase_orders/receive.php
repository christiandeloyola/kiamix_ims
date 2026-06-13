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
        "success"=>false
    ]);
    exit;
}

try{

    $db->beginTransaction();

    $query = "
        SELECT *
        FROM purchase_order_items
        WHERE purchase_order_id = :id
    ";

    $stmt = $db->prepare($query);

    $stmt->execute([
        ":id"=>$data->id
    ]);

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach($items as $item){

        $query = "
            UPDATE inventory_items
            SET quantity =
                quantity + :quantity
            WHERE id = :inventory_item_id
        ";

        $stmt = $db->prepare($query);

        $stmt->execute([
            ":quantity"=>$item['quantity'],
            ":inventory_item_id"=>
                $item['inventory_item_id']
        ]);

        $query = "
            INSERT INTO stock_movements
            (
                inventory_item_id,
                movement_type,
                quantity,
                remarks
            )
            VALUES
            (
                :inventory_item_id,
                'Stock In',
                :quantity,
                'Purchase Order Received'
            )
        ";

        $stmt = $db->prepare($query);

        $stmt->execute([
            ":inventory_item_id"=>
                $item['inventory_item_id'],
            ":quantity"=>$item['quantity']
        ]);
    }

    $query = "
        UPDATE purchase_orders
        SET status='Received'
        WHERE id=:id
    ";

    $stmt = $db->prepare($query);

    $stmt->execute([
        ":id"=>$data->id
    ]);

    $db->commit();

    echo json_encode([
        "success"=>true
    ]);

}
catch(Exception $e){

    $db->rollBack();

    echo json_encode([
        "success"=>false,
        "message"=>$e->getMessage()
    ]);
}