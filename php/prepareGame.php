<?php

session_start();
require_once "./methods.php";

if (!isset($_SERVER['HTTP_REFERER'])) {
	pageError(403);
}

if(basename($_SERVER['HTTP_REFERER']) !== "gestisciPersonaggio.php" || $_SERVER['REQUEST_METHOD'] !== "POST"){
	pageError(403);
}

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome'])){
	pageError(403);
}

$account = unserialize($_SESSION['account']);
$pgName = unserialize($_SESSION['currentPG_nome']);
$personaggio = $account->getPersonaggi($pgName);

if(!$personaggio){
	pageError(401);
}
try{
	$battaglia = $personaggio->getBattagliaInCorso();
	if(!$battaglia){
		$avversario = getRandomPG($account->getId());
		$battaglia = $personaggio->creaCombattimento($avversario);
	}
	else{
		$_SESSION['message'] = "Ripristinata la battaglia iniziata in data: " . date('Y-m-d', strtotime($battaglia['DataInizioBattaglia'])) ."\nDato il ripristino è il turno dell'avversario!";
	}
	
	$stato = json_decode($battaglia['StatoPersonaggi'], associative: true);
	if (isset($stato['pg1']) && isset($stato['pg2'])) {
		$pg1 = Personaggio::fromArray($stato['pg1']);
		$pg2 = Personaggio::fromArray($stato['pg2']);
		$battaglia['pg1'] = serialize($pg1);
		$battaglia['pg2'] = serialize($pg2);
		unset($battaglia['StatoPersonaggi']);
	}
	else{
		pageError(401);
	}
	
	$_SESSION['battaglia'] = serialize($battaglia);
}
catch(Exception $e){
	$errorType = $e->getMessage();
	$error = [
		'message' => ERROR_TYPES[$errorType] ?? $errorType,
		'errorcode' => $e->getCode()
	];

	$_SESSION["errorMessage"] = $error;

	error_log("Errore createPG [" .$error['errorcode'] ."]: " . $error['message']);

	http_response_code($error['errorcode']);
	header("Location: ". $_SERVER['HTTP_REFERER']);
	exit;
}

header("Location: ./gamePage.php");
exit;