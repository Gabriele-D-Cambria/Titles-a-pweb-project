<?php
require_once "../methods.php";
session_start();

if(!isset($_SESSION['account'])){
    apiError(401);
    exit;
}

$account = unserialize(($_SESSION['account']));
$accountId = $account->getId();
$inventory = getInventory($accountId);

header('Content-Type: application/json');

echo json_encode($inventory);
?>