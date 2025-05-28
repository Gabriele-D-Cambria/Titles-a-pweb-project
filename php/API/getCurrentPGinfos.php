<?php

require_once __DIR__ . "/../includes/methods.php";
session_start();

if(!isset($_SESSION['account'])){
	apiError(401);
}

/**
* @var Account $account
*/
$account = unserialize($_SESSION['account']);

$personaggi = $account->getPersonaggi();
$PG_name = unserialize($_SESSION['currentPG_nome']);

$output = $account->getPersonaggi($PG_name);

if($output === null)
	apiError(400);

header('Content-Type: application/json');
echo json_encode($output->getStatsAndEquipment());

?>