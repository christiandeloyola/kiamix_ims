<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();

$db = $database->connect();

$query = "

SELECT *

FROM inventory_items

ORDER BY id DESC

";

$stmt = $db->prepare($query);

$stmt->execute();

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);