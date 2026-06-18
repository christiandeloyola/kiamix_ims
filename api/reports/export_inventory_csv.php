<?php

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$category = $_GET['category'] ?? 'all';
$period = $_GET['period'] ?? 'week';
$start_date = $_GET['start_date'] ?? '';
$end_date = $_GET['end_date'] ?? '';

$where = [];
$params = [];

/*
|--------------------------------------------------------------------------
| Category Filter
|--------------------------------------------------------------------------
*/
if ($category !== 'all') {
    $where[] = "category = :category";
    $params[':category'] = $category;
}

/*
|--------------------------------------------------------------------------
| Date Filter
|--------------------------------------------------------------------------
*/
if (!empty($start_date) && !empty($end_date)) {
    $where[] = "
        DATE(created_at)
        BETWEEN :start_date
        AND :end_date
    ";

    $params[':start_date'] = $start_date;
    $params[':end_date'] = $end_date;
}

/*
|--------------------------------------------------------------------------
| Build WHERE Clause
|--------------------------------------------------------------------------
*/
$whereSql = '';

if (!empty($where)) {
    $whereSql = 'WHERE ' . implode(' AND ', $where);
}

/*
|--------------------------------------------------------------------------
| CSV Headers
|--------------------------------------------------------------------------
*/
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="inventory_report.csv"');

$output = fopen('php://output', 'w');

/*
|--------------------------------------------------------------------------
| CSV Column Headers
|--------------------------------------------------------------------------
*/
fputcsv($output, [
    'Item Name',
    'Category',
    'Quantity',
    'Unit',
    'Unit Price',
    'Stock Value',
    'Created Date'
]);

/*
|--------------------------------------------------------------------------
| Query Inventory
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare("
    SELECT
        item_name,
        category,
        quantity,
        unit,
        unit_price,
        created_at
    FROM inventory_items
    $whereSql
    ORDER BY item_name
");

$stmt->execute($params);

/*
|--------------------------------------------------------------------------
| Export Rows
|--------------------------------------------------------------------------
*/
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $stockValue =
        $row['quantity'] *
        $row['unit_price'];

    fputcsv($output, [
        $row['item_name'],
        $row['category'],
        $row['quantity'],
        $row['unit'],
        number_format($row['unit_price'], 2, '.', ''),
        number_format($stockValue, 2, '.', ''),
        date('Y-m-d', strtotime($row['created_at']))
    ]);
}

fclose($output);
exit;