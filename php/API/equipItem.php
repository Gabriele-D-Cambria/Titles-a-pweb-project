<?php
require_once "../methods.php";
session_start();

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome'])){
	apiError(401);
}

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST" || !isset($_POST['itemId'])){
	pageError(403);
}

$account = unserialize($_SESSION['account']);
$nomePG = unserialize($_SESSION['currentPG_nome']);
$itemId = json_decode($_POST['itemId']);
try{
	if($account->equipItem($nomePG, $itemId))
		$_SESSION['account'] = serialize($account);
	
}
catch(Exception $e){
	apiError($e->getCode(), $e->getMessage());
}

header('Content-Type: application/json');
echo json_encode([
	"error" => false]);

?>