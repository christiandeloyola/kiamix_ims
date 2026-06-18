<?php

session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);

    exit();
}

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$data = json_decode(
    file_get_contents("php://input")
);

if (
    !isset($data->id)
    ||
    !isset($data->status)
) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request"
    ]);

    exit;
}

$role = $_SESSION['role'];
$status = $data->status;

if (
    $status === 'Approved'
    &&
    $role !== 'Administrator'
){

    echo json_encode([
        "success" => false,
        "message" => "Only Administrators can approve orders"
    ]);

    exit();
}

if (
    $status === 'Cancelled'
    &&
    $role !== 'Administrator'
){

    echo json_encode([
        "success" => false,
        "message" => "Only Administrators can cancel orders"
    ]);

    exit();
}

if (
    $status === 'Shipped'
    &&
    !in_array(
        $role,
        ['Administrator','Store Manager']
    )
){

    echo json_encode([
        "success" => false,
        "message" => "Access denied"
    ]);

    exit();
}

if (
    $status === 'Delivered'
    &&
    !in_array(
        $role,
        ['Administrator','Store Manager']
    )
){

    echo json_encode([
        "success" => false,
        "message" => "Access denied"
    ]);

    exit();
}

$query = "
UPDATE purchase_orders
SET status = :status
WHERE id = :id
";

$stmt = $db->prepare($query);

$stmt->bindParam(
    ":status",
    $data->status
);

$stmt->bindParam(
    ":id",
    $data->id,
    PDO::PARAM_INT
);

if ($stmt->execute()) {
    if ($data->status === 'Delivered') {

        $itemsQuery = "
            SELECT
                inventory_item_id,
                quantity
            FROM purchase_order_items
            WHERE purchase_order_id = :purchase_order_id
        ";

        $itemsStmt = $db->prepare($itemsQuery);

        $itemsStmt->execute([
            ':purchase_order_id' => $data->id
        ]);

        $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as $item) {

            $updateInventory = "
                UPDATE inventory_items
                SET quantity = quantity + :qty
                WHERE id = :inventory_item_id
            ";

            $inventoryStmt = $db->prepare($updateInventory);

            $inventoryStmt->execute([
                ':qty' => $item['quantity'],
                ':inventory_item_id' => $item['inventory_item_id']
            ]);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Status updated"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Update failed"
    ]);

}