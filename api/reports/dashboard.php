<?php

header("Content-Type: application/json");

require_once "../../config/database.php";

$database = new Database();
$pdo = $database->connect();

try {

    $response = [];

    // TOTAL ITEMS

    $stmt = $pdo->query("
        SELECT COUNT(*) total_items
        FROM inventory_items
    ");

    $response['total_items'] =
        (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_items'];

    // TOTAL VALUE

    $stmt = $pdo->query("
        SELECT
        SUM(quantity * unit_price) total_value
        FROM inventory_items
    ");

    $response['total_value'] =
        (float)($stmt->fetch(PDO::FETCH_ASSOC)['total_value'] ?? 0);

    // LOW STOCK

    $stmt = $pdo->query("
        SELECT COUNT(*) low_stock
        FROM inventory_items
        WHERE quantity <= min_stock
    ");

    $response['low_stock'] =
        (int)$stmt->fetch(PDO::FETCH_ASSOC)['low_stock'];

    // MOVEMENTS

    $stmt = $pdo->query("
        SELECT COUNT(*) movement_items
        FROM stock_movements
    ");

    $response['movement_items'] =
        (int)$stmt->fetch(PDO::FETCH_ASSOC)['movement_items'];

    // CATEGORY DISTRIBUTION

    $stmt = $pdo->query("
        SELECT
        category,
        SUM(quantity) qty
        FROM inventory_items
        GROUP BY category
    ");

    $response['categories'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // TOP ITEMS

    $stmt = $pdo->query("
        SELECT
        item_name,
        category,
        quantity,
        unit_price,
        (quantity * unit_price) total_value
        FROM inventory_items
        ORDER BY total_value DESC
        LIMIT 5
    ");

    $response['top_items'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // REORDER ITEMS

    $stmt = $pdo->query("
        SELECT
        item_name,
        quantity,
        min_stock,
        (min_stock - quantity) reorder_amount
        FROM inventory_items
        WHERE quantity <= min_stock
    ");

    $response['reorder_items'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // INVENTORY ITEMS FOR REPORT CHARTS

    $stmt = $pdo->query("
        SELECT
            item_name,
            category,
            quantity,
            unit_price AS price
        FROM inventory_items
    ");

    $response['inventory_items'] =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    // MONTHLY STOCK VALUE TREND

    $monthlyValues = [];

    for ($i = 5; $i >= 0; $i--) {

        $monthLabel = date(
            'M Y',
            strtotime("-$i months")
        );

        $monthlyValues[] = [
            'month' => $monthLabel,
            'value' => (float)$response['total_value']
        ];
    }

    $response['monthly_values'] = $monthlyValues;

    echo json_encode($response);

} catch(Exception $e){

    echo json_encode([
        "error" => $e->getMessage()
    ]);
}