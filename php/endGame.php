<?php

require_once "methods.php";
session_start();

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST"){
	pageError(403);
}

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome']) || !isset($_SESSION['battaglia'])){
	pageError(401);
}

/**
 * @var Account
 */
$account = unserialize($_SESSION['account']);
$nomePersonaggio = unserialize($_SESSION['currentPG_nome']);

try{
	$battaglia = unserialize($_SESSION['battaglia']);

	$givenUp = false;
	if(!$battaglia['Terminata']){
		$givenUp = true;
		updateGame($battaglia, false);

		$pg1 = unserialize($battaglia['pg1']);

		$_SESSION['endgameMessage'] = "Ti sei arreso quindi non guadagni ricompense.";

		if($account->unequipPGItem_onlyUsed($nomePersonaggio, $pg1)){
			$_SESSION['endgameMessage'] .= "\n Gli oggetti utilizzati sono comunque stati rimossi.";
		}

	}
}
catch(Exception $e){
	error_log("Errore " . $e->getCode() . ": durante la endGame.php è stato sollevato il seguente errore: ". $e->getMessage());
	pageError($e->getMessage());
}


unset($_SESSION['battaglia']);
$_SESSION['account'] = serialize($account);

session_write_close();

echo json_encode(['ok' => true]);
exit;