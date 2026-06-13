<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();

$db = $database->connect();

$query = "

SELECT
    inventory_items.*,
    suppliers.supplier_name

FROM inventory_items

LEFT JOIN suppliers
ON inventory_items.supplier_id = suppliers.id

ORDER BY inventory_items.id DESC

";

$stmt = $db->prepare($query);

$stmt->execute();

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);