<?php
// FIXME: quando ci sarebbe da ottenere le ricompense, se si quitta non si ottengono. Fai in mod che vengano date subito quando si stabilisce la partita e modifica questo file in modo che gestisca solamente l'abbandono.


require_once "methods.php";
session_start();

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST"){
	pageError(403);
}

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome']) || !isset($_SESSION['battaglia'])){
	pageError(401);
}

$account = unserialize($_SESSION['account']);
$nomePersonaggio = unserialize($_SESSION['currentPG_nome']);

$personaggio = $account->getPersonaggi($nomePersonaggio);

try{
	$battaglia = unserialize($_SESSION['battaglia']);

	$givenUp = false;
	if(!$battaglia['Terminata']){
		$givenUp = true;
		updateGame($battaglia, false);
	}

	// Aggiorno l'unica informazione che si propaga fuori dalla partita, ovvero gli oggetti.

	$pg1 = unserialize($battaglia['pg1']);


	$idOggettiPersonaggio = $personaggio->getOggettiIDs();
	$idOggettiPg1 = $pg1->getOggettiIDs();

	$countPersonaggio = array_count_values($idOggettiPersonaggio);
	$countPg1 = array_count_values($idOggettiPg1);

	foreach($countPersonaggio as $id => $num){
		$numPg1 = isset($countPg1[$id]) ? $countPg1[$id] : 0;
		$diff = $num - $numPg1;
		if($diff > 0){
			for($i = 0; $i < $diff; $i++){
				$account->unequipPGItem($nomePersonaggio, $id, false);
			}
		}
	}

	if(!$givenUp){
		$nLivelliGuadagnati = $account->addPGExp($nomePersonaggio, $battaglia['Vittoria_Giocatore1']);
	
		if($nLivelliGuadagnati === null)
			pageError(500);
	
	
		$exp = $battaglia['Vittoria_Giocatore1']? Personaggio::EXP_WIN : Personaggio::EXP_LOSS;
	
		$_SESSION['endgameMessage'] = "Hai guadagnato " . $exp . " punti esperienza!\n";
	
		if($nLivelliGuadagnati > 0){
			$_SESSION['endgameMessage'] .= "Il personaggio ha guadagnato anche ". $nLivelliGuadagnati . " livell";
			$_SESSION['endgameMessage'] .= ($nLivelliGuadagnati > 1)? "i" : "o";
			$_SESSION['endgameMessage'] .= "!\n Hai guadagnato ".Account::COINS_LVL_UP." monete e sono state aggiunte delle ricompense all'inventario!";
		}
	}
	else{
		$_SESSION['endgameMessage'] = "Ti sei arreso quindi non guadagni ricompense.";
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