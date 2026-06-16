<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$query = "
SELECT
    po.id,
    po.po_number,
    po.reference_no,
    po.supplier_id,
    po.order_date,
    po.expected_date,
    po.status,
    po.shipping_method,
    po.attachment_count,
    po.total_amount,
    po.created_by,
    po.created_at,
    s.supplier_name
FROM purchase_orders po
LEFT JOIN suppliers s
ON po.supplier_id = s.id
ORDER BY po.id DESC
";

$stmt = $db->prepare($query);

$stmt->execute();

echo json_encode(
    $stmt->fetchAll(PDO::FETCH_ASSOC)
);