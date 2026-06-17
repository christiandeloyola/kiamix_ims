<?php

include_once '../../config/database.php';

$database = new Database();
$db = $database->connect();

if (!isset($_GET['id'])) {
    die("Purchase Order ID missing.");
}

$orderId = intval($_GET['id']);

/*
|--------------------------------------------------------------------------
| PURCHASE ORDER
|--------------------------------------------------------------------------
*/

$orderQuery = "

SELECT
    po.*,
    s.supplier_name
FROM purchase_orders po
LEFT JOIN suppliers s
ON po.supplier_id = s.id
WHERE po.id = :id

";

$orderStmt = $db->prepare($orderQuery);

$orderStmt->bindParam(':id', $orderId);

$orderStmt->execute();

$order = $orderStmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    die("Purchase Order not found.");
}

/*
|--------------------------------------------------------------------------
| ORDER ITEMS
|--------------------------------------------------------------------------
*/

$itemQuery = "

SELECT
    poi.*,
    i.item_name,
    i.unit
FROM purchase_order_items poi
LEFT JOIN inventory_items i
ON poi.inventory_item_id = i.id
WHERE poi.purchase_order_id = :id

";

$itemStmt = $db->prepare($itemQuery);

$itemStmt->bindParam(':id', $orderId);

$itemStmt->execute();

$items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

?>

<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>
Purchase Order Receipt
</title>

<style>

body{
    font-family: Arial, sans-serif;
    margin:0;
    padding:20px;
    max-width:800px;
    margin:auto;
    background:#fff;
}

.header{
    text-align:center;
    margin-bottom:30px;
}

.container{
    max-width:800px;
    margin:auto;
}

.header h1{
    margin:0;
}

.info{
    margin-bottom:20px;
}

table{
    width:100%;
    border-collapse:collapse;
}

table th,
table td{
    border:1px solid #000;
    padding:10px;
}

table th{
    background:#f0f0f0;
}

.total{
    margin-top:20px;
    text-align:right;
    font-size:18px;
    font-weight:bold;
}

.print-btn{
    margin-top:30px;
    padding:10px 20px;
    cursor:pointer;
}

@media print{
    .print-btn{
        display:none;
    }
}

</style>

</head>

<body onload="window.print()">

<div class="header">

<img
src="../../assets/images/logo.jpeg"
width="80"
>

<h1 style="margin:5px 0;color:#5D4037;">
    KiAMiX CoffeeBar
</h1>

<h2 style="margin:0;">
    PURCHASE ORDER RECEIPT
</h2>

</div>

<div class="info">

<p>
<strong>PO Number:</strong>
<?= htmlspecialchars($order['po_number']) ?>
</p>

<p>
<strong>Reference:</strong>
<?= htmlspecialchars($order['reference_no']) ?>
</p>

<p>
<strong>Supplier:</strong>
<?= htmlspecialchars($order['supplier_name']) ?>
</p>

<p>
<strong>Order Date:</strong>
<?= htmlspecialchars($order['order_date']) ?>
</p>

<p>
<strong>Expected Date:</strong>
<?= htmlspecialchars($order['expected_date']) ?>
</p>

<p>
<strong>Status:</strong>
<?= htmlspecialchars($order['status']) ?>
</p>

<p>
<strong>Shipping Method:</strong>
<?= htmlspecialchars($order['shipping_method']) ?>
</p>

</div>

<table>

<thead>

<tr>
<th>Item</th>
<th>Quantity</th>
<th>Unit</th>
<th>Unit Price</th>
<th>Total</th>
</tr>

</thead>

<tbody>

<?php foreach($items as $item): ?>

<tr>

<td>
<?= htmlspecialchars($item['item_name']) ?>
</td>

<td>
<?= number_format($item['quantity'],2) ?>
</td>

<td>
<?= htmlspecialchars($item['unit']) ?>
</td>

<td>
₱<?= number_format($item['unit_price'],2) ?>
</td>

<td>
₱<?= number_format($item['total_price'],2) ?>
</td>

</tr>

<?php endforeach; ?>

</tbody>

</table>

<div class="total">

Grand Total:
₱<?= number_format($order['total_amount'],2) ?>

</div>

<button
class="print-btn"
onclick="window.print()"
>

Print Receipt

</button>

</body>
</html>