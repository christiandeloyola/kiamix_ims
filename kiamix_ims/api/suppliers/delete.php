<?php

header("Content-Type: application/json");

include_once "../../config/database.php";

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$query = "
DELETE FROM suppliers
WHERE id = :id
";

$stmt = $db->prepare($query);

$stmt->bindParam(":id",$data->id);

if($stmt->execute()){
    echo json_encode([
        "success"=>true,
        "message"=>"Supplier deleted"
    ]);
}else{
    echo json_encode([
        "success"=>false,
        "message"=>"Delete failed"
    ]);
}