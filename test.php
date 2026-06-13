<?php

include_once
'config/database.php';

$database = new Database();

$db = $database->connect();

if($db){

    echo "Connected Successfully";

}else{

    echo "Connection Failed";

}