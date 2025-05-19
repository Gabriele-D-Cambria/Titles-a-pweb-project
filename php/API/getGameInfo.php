<?php

require_once "../methods.php";
session_start();

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome'])){
	apiError(403);
}

if(!isset($_SESSION['battaglia'])){
	apiError(401);
}

$battaglia = unserialize($_SESSION['battaglia']);

$stato = json_decode($battaglia['StatoPersonaggi'], true);

if(!isset($stato['pg1']) || !isset($stato['pg2'])){
	apiError(401);
}

$durataTurno = Personaggio::DEFAULT_TURN_TIME;
$currentTime = new DateTime("now");

$tempoPassato = $currentTime->getTimestamp() - $battaglia['DataUltimoTurno']->getTimestamp();

$tempoRimanente =Personaggio::DEFAULT_TURN_TIME - $tempoPassato;

if($tempoRimanente < 0){
	error_log("FAI IL CAMBIO TURNO!");
}

$minuti = $tempoRimanente / 60;
$secondi = $tempoRimanente % 60;
$tempoRimanenteFormattato = sprintf("%02d:%02d", $minuti, $secondi);

$myPG = $stato['pg1'];
$pg1_filtrato = [
    'nome'            => $myPG['nome'],
    'pathImmaginePG'  => $myPG['pathImmaginePG'],
    'PF'              => $myPG['PF'],
    'temp_PF'         => $myPG['temp_PF'],
    'arma' 			  => $myPG['arma']['pathImmagine'],
    'armatura' 		  => $myPG['armatura']['pathImmagine'],
    'zaino' 		  => $myPG['zaino']
];

$enemyPG = $stato['pg2'];

$pg2_filtrato = [
    'nome'            => $enemyPG['nome'],
    'pathImmaginePG'  => $enemyPG['pathImmaginePG'],
    'PF'              => $enemyPG['PF'],
    'temp_PF'         => $enemyPG['temp_PF'],
    'arma' 			  => $enemyPG['arma']['pathImmagine'],
    'armatura' 		  => $enemyPG['armatura']['pathImmagine']
];


$output = [
	'pg1'			 		 => $pg1_filtrato,
	'pg2'			 		 => $pg2_filtrato,
	'turno' 		 		 => $battaglia['Turno_Giocatore1'],
    'tempoRimanente' 		 => $tempoRimanenteFormattato,
	'tempoRimanente_secondi' => $tempoRimanente
];

header('Content-Type: application/json');
echo json_encode($output);
