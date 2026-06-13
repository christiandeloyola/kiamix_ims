<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if(empty($data->supplier_name)){
    echo json_encode([
        "success" => false,
        "message" => "Supplier name required"
    ]);
    exit;
}

$query = "
INSERT INTO suppliers
(
    supplier_name,
    contact_person,
    phone,
    email,
    address,
    supplied_items
)
VALUES
(
    :supplier_name,
    :contact_person,
    :phone,
    :email,
    :address,
    :supplied_items
)
";

$stmt = $db->prepare($query);

$stmt->bindParam(":supplier_name", $data->supplier_name);
$stmt->bindParam(":contact_person", $data->contact_person);
$stmt->bindParam(":phone", $data->phone);
$stmt->bindParam(":email", $data->email);
$stmt->bindParam(":address", $data->address);
$stmt->bindParam(":supplied_items", $data->supplied_items);

if($stmt->execute()){
    echo json_encode([
        "success" => true,
        "message" => "Supplier created"
    ]);
}else{
    echo json_encode([
        "success" => false,
        "message" => "Failed to create supplier"
    ]);
}