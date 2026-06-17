<?php

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="inventory_report.csv"');

$output = fopen('php://output', 'w');

fputcsv($output, [
    'Item Name',
    'Category',
    'Quantity',
    'Unit',
    'Unit Price',
    'Stock Value'
]);

$stmt = $pdo->query("
    SELECT
        item_name,
        category,
        quantity,
        unit,
        unit_price
    FROM inventory_items
    ORDER BY item_name
");

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $stockValue =
        $row['quantity'] *
        $row['unit_price'];

    fputcsv($output, [
        $row['item_name'],
        $row['category'],
        $row['quantity'],
        $row['unit'],
        $row['unit_price'],
        $stockValue
    ]);
}

fclose($output);
exit;