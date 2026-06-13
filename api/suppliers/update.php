<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$query = "
UPDATE suppliers
SET
    supplier_name = :supplier_name,
    contact_person = :contact_person,
    phone = :phone,
    email = :email,
    address = :address,
    supplied_items = :supplied_items
WHERE id = :id
";

$stmt = $db->prepare($query);

$stmt->bindParam(":supplier_name",$data->supplier_name);
$stmt->bindParam(":contact_person",$data->contact_person);
$stmt->bindParam(":phone",$data->phone);
$stmt->bindParam(":email",$data->email);
$stmt->bindParam(":address",$data->address);
$stmt->bindParam(":supplied_items",$data->supplied_items);
$stmt->bindParam(":id",$data->id);

if($stmt->execute()){
    echo json_encode([
        "success"=>true,
        "message"=>"Supplier updated"
    ]);
}else{
    echo json_encode([
        "success"=>false,
        "message"=>"Update failed"
    ]);
}