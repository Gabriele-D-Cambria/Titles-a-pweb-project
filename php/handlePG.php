<?php
require_once "methods.php";
session_start();

if(!isset($_SESSION['account']))
	pageError(401);

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST"){
	pageError(403);
}

$account = unserialize($_SESSION['account']);
$userId = $account->getId();

if(isset($_POST['deleteCheck'])){
	// Richiesta di eliminazione Personaggio
	try{
		if(!isset($_SESSION['currentPG_nome'])){
			throw new Exception("pg_not_selected", 400);
		}

		$nome = unserialize($_SESSION['currentPG_nome']);

		if(!$account->removePersonaggio($nome)){
			throw new Exception("pg_not_found", 400);
		}

		unset($_SESSION['currentPG_nome']);

		$_SESSION["account"] = serialize($account);
		$_SESSION["message"] = "Personaggio ". $nome ." eliminato con successo!";
		header("Location: ./dashboard.php");
		exit;
	}
	catch(Exception $e){
		sendError($e, "errorMessage", "./dashboard.php");
	}

}
else if(isset($_POST['upgrade'])){
	try{
		if(!isset($_SESSION['currentPG_nome'])){
			throw new Exception("pg_not_selected", 400);
		}

		$nome = unserialize($_SESSION['currentPG_nome']);

		$newPF = $_POST["PF"];
		$newFOR = $_POST["FOR"];
		$newDES = $_POST["DES"];
		
		if(!$account->updatePgStats($nome, $newPF, $newFOR, $newDES)){
			throw new Exception("upgrade_failed", 400);
		}

		$_SESSION['account'] = serialize($account);
		$_SESSION['message'] = "Personaggio " . $nome . " migliorato con successo!";
		header("Location: ./gestisciPersonaggio.php");
		exit;
	}
	catch(Exception $e){
		sendError($e, "errorMessage", "./dashboard.php");
	}
}
else{
	// Richiesta di Recupero o Creazione Personaggio
	try{

		$name = $_POST['PG-name'];
		if(is_null($name) || !preg_match(PG_NAME_PATTERN, $name)){
			throw new Exception("invalid_pg_name", 400);
		}

		$personaggi = $account->getPersonaggi($name);

		if($personaggi !== null){
			throw new Exception("pg_name_taken");
		}

		$element = $_POST['element'];
		if (is_null($element)) {
			throw new Exception("invalid_element", 400);
		}

		if(!$account->addNewPersonaggio($name, $element)){
			throw new Exception('full_PG', 400);
		}

		$_SESSION['account'] = serialize($account);
		$_SESSION['currentPG_nome'] = serialize($name);

		header("Location: ./gestisciPersonaggio.php");
		exit;
	}
	catch(Exception $e){
		sendError($e, "createPGError", "./creazionePersonaggio.php");
	}
}

/**
 * Funzione che si occupa di inviare messaggi di errori sollevati durante validazione di richieste tramite form tramite la `$_SESSION`
 * @param Exception $e eccezzione sollevata
 * @param string $sessionId id da dare all'errore salvato nella sessione
 * @param string $dest indirizzo della pagina dove tornare a seguito dell'errore
 * @return never
 */
function sendError($e, $sessionId, $dest){
	$errorType = $e->getMessage();
	$error = [
		'message' => ERROR_TYPES[$errorType] ?? $errorType,
		'errorcode' => $e->getCode()
	];

	$_SESSION[$sessionId] = $error;

	error_log("Errore createPG [" .$error['errorcode'] ."]: " . $error['message']);

	http_response_code($error['errorcode']);
	header("Location: ". $dest);
	exit;
}


?>