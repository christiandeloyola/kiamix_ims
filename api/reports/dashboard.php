<?php

header("Content-Type: application/json");

require_once "../../config/database.php";

$database = new Database();
$pdo = $database->connect();

$period = $_GET['period'] ?? 'week';
$category = $_GET['category'] ?? 'all';
$start_date = $_GET['start_date'] ?? '';
$end_date = $_GET['end_date'] ?? '';

$where = [];
$params = [];

if ($category !== 'all') {
    $where[] = "category = :category";
    $params[':category'] = $category;
}

if (!empty($start_date) && !empty($end_date)) {

    $where[] =
        "DATE(created_at)
        BETWEEN :start_date
        AND :end_date";

    $params[':start_date'] = $start_date;
    $params[':end_date'] = $end_date;
}

$whereSql = '';

if (!empty($where)) {
    $whereSql = 'WHERE ' . implode(' AND ', $where);
}

try {

    $response = [];

    // TOTAL ITEMS

    $stmt = $pdo->prepare("
        SELECT COUNT(*) total_items
        FROM inventory_items
        $whereSql
    ");

    $stmt->execute($params);

    $response['total_items'] =
        (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_items'];

    // TOTAL VALUE

    $stmt = $pdo->prepare("
        SELECT
            SUM(quantity * unit_price) total_value
        FROM inventory_items
        $whereSql
    ");

    $stmt->execute($params);

    $response['total_value'] =
        (float)($stmt->fetch(PDO::FETCH_ASSOC)['total_value'] ?? 0);

    // LOW STOCK

    $lowStockWhere = $whereSql;

    if ($lowStockWhere) {
        $lowStockWhere .= " AND quantity <= min_stock";
    } else {
        $lowStockWhere = "WHERE quantity <= min_stock";
    }

    $stmt = $pdo->prepare("
        SELECT COUNT(*) low_stock
        FROM inventory_items
        $lowStockWhere
    ");

    $stmt->execute($params);

    $response['low_stock'] =
        (int)$stmt->fetch(PDO::FETCH_ASSOC)['low_stock'];

    // CATEGORY DISTRIBUTION

    $stmt = $pdo->prepare("
        SELECT
            category,
            SUM(quantity) qty
        FROM inventory_items
        $whereSql
        GROUP BY category
    ");

    $stmt->execute($params);

    $response['categories'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // TOP ITEMS

    $stmt = $pdo->prepare("
        SELECT
            item_name,
            category,
            quantity,
            unit_price,
            (quantity * unit_price) total_value
        FROM inventory_items
        $whereSql
        ORDER BY total_value DESC
        LIMIT 5
    ");

    $stmt->execute($params);

    $response['top_items'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // REORDER ITEMS

    $reorderWhere = $whereSql;

    if ($reorderWhere) {
        $reorderWhere .= " AND quantity <= min_stock";
    } else {
        $reorderWhere = "WHERE quantity <= min_stock";
    }

    $stmt = $pdo->prepare("
        SELECT
            item_name,
            quantity,
            min_stock,
            (min_stock - quantity) reorder_amount
        FROM inventory_items
        $reorderWhere
    ");

    $stmt->execute($params);

    $response['reorder_items'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // INVENTORY ITEMS FOR REPORT CHARTS

    $stmt = $pdo->prepare("
        SELECT
            item_name,
            category,
            quantity,
            unit_price AS price
        FROM inventory_items
        $whereSql
    ");

    $stmt->execute($params);

    $response['inventory_items'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch(Exception $e){

    echo json_encode([
        "error" => $e->getMessage()
    ]);
}