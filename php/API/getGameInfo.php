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


$stato = json_decode($battaglia['StatoBattaglia'], true);

if(!isset($stato['pg1']) || !isset($stato['pg2'])){
	apiError(401);
}

$output = [
	'pg1'			 => $stato['pg1'] ?? null,
	'pg2'			 => $stato['pg2'] ?? null,
	'turno' 		 => $battaglia['Turno_Giocatore1'],
    'tempoRimanente' => $battaglia['TempoRimanente']
];

header('Content-Type: application/json');
echo json_encode($output);
