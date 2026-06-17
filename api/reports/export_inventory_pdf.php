<?php

require_once '../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$stmt = $pdo->query("
    SELECT *
    FROM inventory_items
    ORDER BY item_name
");

$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Inventory Report</title>

<style>

body{
    font-family: Arial, sans-serif;
    padding:20px;
}

table{
    width:100%;
    border-collapse:collapse;
}

th,td{
    border:1px solid #000;
    padding:8px;
    text-align:left;
}

h1{
    text-align:center;
}

</style>

</head>

<body>

<h1>KIAMIX COFFEEBAR INVENTORY REPORT</h1>

<p>
Generated:
<?= date('F d, Y h:i A'); ?>
</p>

<table>

<tr>
    <th>Item Name</th>
    <th>Category</th>
    <th>Quantity</th>
    <th>Unit Price</th>
    <th>Stock Value</th>
</tr>

<?php foreach($items as $item): ?>

<tr>
    <td><?= htmlspecialchars($item['item_name']) ?></td>
    <td><?= htmlspecialchars($item['category']) ?></td>
    <td><?= $item['quantity'] ?></td>
    <td>₱<?= number_format($item['unit_price'],2) ?></td>
    <td>
        ₱<?= number_format(
            $item['quantity'] *
            $item['unit_price'],
            2
        ) ?>
    </td>
</tr>

<?php endforeach; ?>

</table>

<script>
window.print();
</script>

</body>
</html>