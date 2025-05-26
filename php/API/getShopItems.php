<?php
require_once __DIR__ . "/../includes/methods.php";
session_start();

if(!isset($_SESSION['account'])){
	apiError(401);
	exit;
}

$account = unserialize($_SESSION['account']);

$id = $account->getId();
$lastRefresh = $account->getShopRefresh();

$shopData = getShop($id, $lastRefresh);

$shopItems = $shopData['output'];

header('Content-Type: application/json');
if(isset($shopItems['updateTime'])){
	$account->updateShopTimer($shopItems['updateTime']);
	$_SESSION['account'] = serialize($account);
	echo json_encode([
        'items' => $shopItems['items'],
        'remainingTime' => $shopData['remainingTime']
    ]);
}
else
	echo json_encode([
		'items' => $shopItems,
		'remainingTime' => $shopData['remainingTime']
	]);

?>