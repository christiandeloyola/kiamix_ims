<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

if (!isset($_GET['id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Purchase Order ID required"
    ]);

    exit;
}

$id = intval($_GET['id']);

$query = "
SELECT
    po.*,
    s.supplier_name
FROM purchase_orders po
LEFT JOIN suppliers s
    ON po.supplier_id = s.id
WHERE po.id = :id
LIMIT 1
";

$stmt = $db->prepare($query);

$stmt->bindParam(
    ":id",
    $id,
    PDO::PARAM_INT
);

$stmt->execute();

$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {

    echo json_encode([
        "success" => false,
        "message" => "Purchase Order not found"
    ]);

    exit;
}

/*
    Optional:
    Add purchase_order_items later
*/

$order["items"] = [];

echo json_encode($order);