<?php

require_once "config/database.php";
require_once "api/logs/audit.php";

$database = new Database();
$db = $database->connect();

logAction(
    $db,
    1,
    'TEST',
    'AUDIT',
    'Testing audit log'
);

echo "DONE";