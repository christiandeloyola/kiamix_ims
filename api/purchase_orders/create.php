<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (
    empty($data->supplier_id) ||
    empty($data->order_date) ||
    empty($data->items)
) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

try {

    $db->beginTransaction();

    $reference_no = time();

    $stmtPO = $db->query("
        SELECT IFNULL(MAX(id), 0) + 1 AS next_po
        FROM purchase_orders
    ");

    $nextPO = $stmtPO->fetch(PDO::FETCH_ASSOC);

    $po_number = "PO" . str_pad($nextPO['next_po'], 3, "0", STR_PAD_LEFT);

    $stmt = $db->prepare($query);

    $total_amount = 0;

    foreach($data->items as $item){
        $total_amount += $item->quantity * $item->unit_price;
    }

    $query = "
        INSERT INTO purchase_orders
        (
            po_number,
            reference_no,
            supplier_id,
            order_date,
            expected_date,
            status,
            shipping_method,
            attachment_count,
            total_amount,
            created_by
        )
        VALUES
        (
            :po_number,
            :reference_no,
            :supplier_id,
            :order_date,
            :expected_date,
            'Pending',
            :shipping_method,
            :attachment_count,
            :total_amount,
            :created_by
        )
    ";

    $stmt = $db->prepare($query);

    $stmt->execute([
        ":po_number" => $po_number,
        ":reference_no" => $reference_no,
        ":supplier_id" => $data->supplier_id,
        ":order_date" => $data->order_date,
        ":expected_date" => $data->expected_date,
        ":shipping_method" => $data->shipping_method ?? 'Ground',
        ":attachment_count" => $data->attachment_count ?? 0,
        ":total_amount" => $total_amount,
        ":created_by" => 1
    ]);

    $purchase_order_id = $db->lastInsertId();

    foreach($data->items as $item){

        $query = "
            INSERT INTO purchase_order_items
            (
                purchase_order_id,
                inventory_item_id,
                quantity,
                unit_price,
                total_price
            )
            VALUES
            (
                :purchase_order_id,
                :inventory_item_id,
                :quantity,
                :unit_price,
                :total_price
            )
        ";

        $stmt = $db->prepare($query);

        $stmt->execute([
            ":purchase_order_id" => $purchase_order_id,
            ":inventory_item_id" => $item->inventory_item_id,
            ":quantity" => $item->quantity,
            ":unit_price" => $item->unit_price,
            ":total_price" => (
                $item->quantity * $item->unit_price
            )
        ]);
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Purchase Order Created"
    ]);

}
catch(Exception $e){

    $db->rollBack();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}