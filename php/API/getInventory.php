<?php
if (basename($_SERVER['PHP_SELF']) === 'getInventory.php') {
    pageError(403);
}

session_start();
require_once "../methods.php";

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