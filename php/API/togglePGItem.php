<?php
require_once __DIR__ . "/../includes/methods.php";
session_start();

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome'])){
	apiError(401);
}

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST" || 
   (!isset($_POST['itemId']) && !isset($_POST['itemId_remove']))){
	pageError(403);
}

$account = unserialize($_SESSION['account']);
$nomePG = unserialize($_SESSION['currentPG_nome']);
try{
	if(isset($_POST['itemId'])){
		$itemId = json_decode($_POST['itemId']);
	
		if($account->equipItem($nomePG, $itemId))
			$_SESSION['account'] = serialize($account);
		
	}
	else{
		$itemId = json_decode($_POST['itemId_remove']);
		
		if($account->unequipPGItem($nomePG, $itemId)){
			$_SESSION['account'] = serialize($account);
		}
	}
}
catch(Exception $e){
	apiError($e->getCode(), $e->getMessage());
}



header('Content-Type: application/json');
echo json_encode([
	"error" => false]);

?>