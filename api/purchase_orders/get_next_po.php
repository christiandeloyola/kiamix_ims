<?php

include_once "../../config/database.php";

$query = "
SELECT po_number
FROM purchase_orders
ORDER BY id DESC
LIMIT 1
";

$stmt = $conn->prepare($query);
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if($row){

    $number = (int) preg_replace('/[^0-9]/', '', $row['po_number']);

    $next = $number + 1;

} else {

    $next = 1;
}

echo json_encode([
    'po_number' => 'PO-' . str_pad($next, 3, '0', STR_PAD_LEFT)
]);