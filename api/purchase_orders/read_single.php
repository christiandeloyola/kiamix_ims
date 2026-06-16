<?php

header("Content-Type: application/json");

include_once '../../config/database.php';

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
WHERE po.id = ?
LIMIT 1
";

$stmt = $db->prepare($query);
$stmt->execute([$id]);

$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {

    echo json_encode([
        "success" => false,
        "message" => "Purchase Order not found"
    ]);

    exit;
}

$itemQuery = "
SELECT
    poi.*,
    i.item_name
FROM purchase_order_items poi
LEFT JOIN inventory_items i
ON poi.inventory_item_id = i.id
WHERE poi.purchase_order_id = ?
";

$itemStmt = $db->prepare($itemQuery);
$itemStmt->execute([$id]);

$order['items'] =
    $itemStmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => $order
]);