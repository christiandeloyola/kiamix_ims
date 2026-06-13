<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$query = "
SELECT *
FROM suppliers
ORDER BY id DESC
";

$stmt = $db->prepare($query);
$stmt->execute();

$suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($suppliers);