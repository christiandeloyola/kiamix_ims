<?php

header("Content-Type: application/json");

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