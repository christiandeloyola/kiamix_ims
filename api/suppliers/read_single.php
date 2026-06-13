<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$id = isset($_GET['id']) ? $_GET['id'] : 0;

$query = "
SELECT *
FROM suppliers
WHERE id = :id
LIMIT 1
";

$stmt = $db->prepare($query);
$stmt->bindParam(":id",$id);
$stmt->execute();

$supplier = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($supplier);