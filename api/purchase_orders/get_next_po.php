<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$stmt = $db->query("
    SELECT IFNULL(MAX(id), 0) + 1 AS next_po
    FROM purchase_orders
");

$row = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "po_number" => "PO" . str_pad($row['next_po'], 3, "0", STR_PAD_LEFT)
]);