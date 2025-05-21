<?php
session_start();
require_once "./methods.php";

// FIXME: errori nell'utilizzo degli oggetti. Da indagare meglio

if(!isset($_SESSION['battaglia']) || !isset($_SESSION['account'])){
	apiError(403, "Sessione non valida!");
}

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST"){
	apiError(405, "Metodo non consentito");
}

$battaglia = unserialize($_SESSION['battaglia']);

if($battaglia['Terminata']){
	echo json_encode(["ok" => false]);
	exit;
}
	
/**
 * @var Personaggio
 */
$pg1 = unserialize($battaglia['pg1']);
/**
 * @var Personaggio
 */
$pg2 = unserialize($battaglia['pg2']);

$turnoAttuale = $battaglia["Turno_Giocatore1"];

$oraAttuale = new DateTime("now");
$inizioUltimoTurno = unserialize($battaglia['DataUltimoTurno']);

/**
 * @var $randomMove è `false` solo se il turno è dell'utente (`$turnoAttuale === true`) e se la mossa selezionata dall'utente è valida e non casuale e/o con oggetti casuali
 */
$randomMove = false;
$victory = null;
$message = "";

try{
	if($turnoAttuale){

		$azione = $_POST['azione'] ?? null;

		$randomMove =
			// Superato il limite di tempo
			$oraAttuale->getTimestamp() - $inizioUltimoTurno->getTimestamp() >= Personaggio::DEFAULT_TURN_TIME ||
			// non è stata selezionata un'azione
			!$azione ||
			// L'azione è quella di usare un'oggetto ma non è specificato quale
			($azione === 'usa_oggetto' && !isset($_POST['oggetto_index'])) ||
			// L'azione è casuale
			$azione === 'casuale';

		if(!$randomMove){
			if($azione === 'attacco'){
				$esito = $pg1->attack($pg2);
				$message .= ($esito['colpito'])?
					"Il tuo colpo ha colpito!\n Hai fatto " . $esito['dannoInflitto'] . " danni":
					"L'avversario ha schivato!";
			}
			else{
				$objectToUse = $_POST['oggetto_index'];
				if(!$pg1->useItem($objectToUse)){
					$randomMove = true;
					$message .= "Non posiedi questo oggetto, la tua mossa sarà quindi scelta casualmente.\n";
				}
				else{
					$message .= "Hai utilizzato l'oggetto!\n";
				}
			}
		}

		if($randomMove){
			$esito = randomMove($pg1, $pg2);
			if($esito['mossa'] === 'attacco'){
				$message .= "Hai attaccato";
				$message .= ($esito['colpito'])?
					" e il tuo colpo ha colpito!\n Hai fatto " . $esito['dannoInflitto'] . " danni\n":
					", ma l'avversario ha schivato!";
			}
			else{
				$message .= "Hai utilizzato l'oggetto " . $esito['oggetto'] . "\n";
			}
		}

	}
	else{
		$esito = randomMove($pg2, $pg1);
		$message .= $pg2->getNome();
		if($esito['mossa'] === 'attacco'){
			$message .= " ha attaccato";
			$message .= ($esito['colpito'])?
				" e il suo colpo ha colpito!\n Ti ha fatto " . $esito['dannoInflitto'] . " danni\n":
				", ma lo hai schivato!";
		}
		else{
			$message .= " ha utilizzato l'oggetto " . $esito['oggetto'] . "\n";
		}
	}


	$battaglia['pg1'] = serialize($pg1);
	$battaglia['pg2'] = serialize($pg2);
	$battaglia["Turno_Giocatore1"] = !$turnoAttuale;
	$battaglia['DataUltimoTurno'] = serialize($oraAttuale);

	($pg1->isDead() || $pg2->isDead())?
		updateGame($battaglia, $pg2->isDead()):
		updateGame($battaglia);

	$_SESSION['battaglia'] = serialize($battaglia);
	$_SESSION['gameMessage'] = $message;
}
catch(Exception $e){
	error_log($e->getMessage(), $e->getCode());
	apiError(500, "ERRORE DEL SERVER");
}

header('Content-Type: application/json');
echo json_encode(["ok" => true]);


/**
 * Il pg1 esegue una mossa casuale sul pg2
 * @param Personaggio $pg1 colui che fa la mossa
 * @param Personaggio $pg2 colui che subisce la mossa
 * @param boolean $updateDB indica se la mossa deve avere ripercussioni sullo zaino complessivo del personaggio. [Default: `false`]
 * @return array contenente informazioni sulla mossa eseguita
 * 		- `"mossa": indica la mossa eseguita
 * 		- `"colpito"`?: SOLO SE la mossa era `"attacco"`
 * 		- `"dannoInflitto"`?: SOLO SE la mossa era `"attacco"` e `"colpito"` è `true`
 * 		- `"oggetto"`?: SOLO SE la mossa era `"oggetto"`, contiene il nome dell'oggetto utilizzato
 */
function randomMove(&$pg1, &$pg2, $updateDB = false){
	$output = [
		"mossa" => null,
	];


	$pg1VitaStats = $pg1->getAllPF();
	if($pg1VitaStats['tmp_PF'] < ($pg1VitaStats['PF'] / 2)){
		$oggetto = $pg1->getBestOggettoCura();
		if($oggetto){
			$output['mossa'] = 'oggetto';
			$oggetti = [$oggetto];
		}
	}

	if(!$output['mossa']){
		$pg2VitaStats = $pg2->getAllPF();
		if($pg2VitaStats['tmp_PF'] < ($pg2VitaStats['PF'] / 2)){
			$azioni = ['attacco'];
			$oggetto = $pg1->getBestOggettoFOR();
			if($oggetto){
				$azioni[] = 'oggetto';
				$oggetti = [$oggetto];
			}

			$output['mossa'] = $azioni[array_rand($azioni)];
		}
	}

	if(!$output['mossa']){
		$oggetti = $pg1->getOggettiUtilizzabili();
		$azioni = ['attacco'];
		if($oggetti !== null)
			$azioni[] = 'oggetto';

		$output['mossa'] = $azioni[array_rand($azioni)];
	}


	

	if($output['mossa'] === 'attacco'){
			$esitoMossa = $pg1->attack($pg2);
			$output['colpito'] = $esitoMossa['colpito'];
			if($esitoMossa['colpito']){
				$output['dannoInflitto'] = $esitoMossa['dannoInflitto'];
			}
	}
	else{
		$oggetto = $oggetti[array_rand($oggetti)];
		$pg1->useItem($oggetto['ID'], $updateDB);
		$output['oggetto'] = $oggetto['Nome'];
	}

	return $output;
}

/**
 * Questa funzione aggiorna i dati relativi allo stato dei personaggi e la data dell'ultimo turno per una battaglia specifica
 * @param array $battagliaInfo Array associativo preso per riferimento contenente le informazioni della battaglia
 * @param boolean|null $terminata `true` indica che ha vinto il personaggio1, `false` che ha vinto il perosnaggio2. Se non ha vinto nessuno da mantenere `null` [Default: null]
 * @throws Exception Se la connessione al database fallisce o se si verifica un errore durante l'update.
 * @return bool Restituisce true se l'aggiornamento è andato a buon fine.
 */
function updateGame(&$battagliaInfo, $terminata = null){
    $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
    if($conn->connect_error){
        throw new Exception("Connessione al database fallita: " . $conn->connect_error, 500);
    }

    $conn->begin_transaction();
    $stmt = null;
    try {
        // Prepara lo stato aggiornato dei personaggi
        $pg1 = unserialize($battagliaInfo['pg1']);
        $pg2 = unserialize($battagliaInfo['pg2']);
        $statoPersonaggi = [
            "pg1" => $pg1->getAll(),
            "pg2" => $pg2->getAll()
        ];
        $statoPersonaggiJson = json_encode($statoPersonaggi);

        $sql = ($terminata === null)?
			"UPDATE Combattimenti
			 SET StatoPersonaggi = ?, DataUltimoTurno = ?
			 WHERE Giocatore1_Nome = ? AND Giocatore1_Proprietario = ?
			 AND Giocatore2_Nome = ? AND Giocatore2_Proprietario = ? AND Terminata = 0":
			"UPDATE Combattimenti
			 SET Vittoria_Giocatore1 = ?
             WHERE Giocatore1_Nome = ? AND Giocatore1_Proprietario = ?
             AND Giocatore2_Nome = ? AND Giocatore2_Proprietario = ? AND Terminata = 0";

        $stmt = $conn->prepare($sql);

        $dataUltimoTurno = unserialize($battagliaInfo['DataUltimoTurno'])->format('Y-m-d H:i:s');

		$types = ($terminata === null)? "sssisi" : "isisi";
		$vars  = ($terminata === null)? 
		[$statoPersonaggiJson, $dataUltimoTurno, $battagliaInfo['Giocatore1_Nome'], $battagliaInfo['Giocatore1_Proprietario'], $battagliaInfo['Giocatore2_Nome'], $battagliaInfo['Giocatore2_Proprietario']]:
		[$terminata, $battagliaInfo['Giocatore1_Nome'], $battagliaInfo['Giocatore1_Proprietario'], $battagliaInfo['Giocatore2_Nome'], $battagliaInfo['Giocatore2_Proprietario']];
		
        $stmt->bind_param($types, ...$vars);
            

        if(!$stmt->execute()){
            $conn->rollback();
            throw new Exception("Errore durante l'update della battaglia: " . $stmt->error, 500);
        }

		if($terminata !== null){
			$battagliaInfo['Vittoria_Giocatore1'] = $terminata;
			$battagliaInfo['Terminata'] = true;
			$battagliaInfo['DataUltimoTurno'] = null;
			$battagliaInfo['StatoPersonaggi'] = null;
			$battagliaInfo['Turno_Giocatore1'] = null;
		}
        $conn->commit();
        return true;
    }
    finally {
        if($stmt) $stmt->close();
        $conn->close();
    }
}

?>