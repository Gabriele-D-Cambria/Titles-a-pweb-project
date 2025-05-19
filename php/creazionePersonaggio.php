<?php
session_start();

require_once "methods.php";

if(!isset($_SESSION['account'])){
	pageError("401");
}

if (!isset($_SERVER['HTTP_REFERER']) || 
	basename(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH)) !== "dashboard.php" &&
	basename(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH)) !== "creazionePersonaggio.php") {
	header("Location: ./dashboard.php");
	exit;
}

$account = unserialize($_SESSION['account']);

if(count($account->getPersonaggi()) === Account::MAX_NUM_PERSONAGGI){
	$_SESSION['message'] = ERROR_TYPES['full_PG'];
	header("Location: ./dashboard.php");
	exit;
}

$message = null;
if(isset($_SESSION["createPGError"])){
    $message = $_SESSION["createPGError"];
    unset($_SESSION["createPGError"]);
}



?>

<!DOCTYPE html>
<html lang="it">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Titles</title>
    <link rel="icon" href="./../images/icon.svg" type="image/svg+xml" sizes="16x16" >
	<link rel="stylesheet" href="./../css/style.css">
	<link rel="stylesheet" href="./../css/personaggio.css">
	<link rel="stylesheet" href="./../css/pgAnimations.css">
	<script type="module" src="./../js/creazionePersonaggio.js"></script>
	<script>
		const createPGError = <?php echo json_encode($message)?>;
	</script>
</head>
<body>
	<header>
        <h1><i>Titles</i></h1>
        <div>
            <form action="logout.php" method="POST">
                <button type="submit">Logout</button>
            </form>
        </aside>
    </header>
	<main class="main-section">
		<form class="page-box" action="handlePG.php" method="POST">
			<div class="stats-section">
				<div class="lvl-block">
					<p class="lvl-info">Livello <span id="user-lvl">1</span></p>
					<!-- <p class="pu-info">PU: <span id="PU-points">3</span></p> -->
					<div class="exp-bar">
						<!-- <div class="exp-points" style="width: 60%;"></div> -->
					</div>
				</div>
				<div class="stats-block PF">
					<div class="PF-points-block"><div id="PF" class="PF-amount"></div></div>
					<p>PF</p>
				</div>
				<div class="stats-block FOR">
					<div class="FOR-points-block">
						<div class="FOR-amount" id="FOR"></div>
					</div>
					<p>FOR</p>
				</div>
				<div class="stats-block DES">
					<div class="DES-points-block">
						<div class="DES-amount" id="DES"></div>
					</div>
					<p>DES</p>
				</div>
			</div>
			<div class="character-section">
				<div class="character-box">
					<input type="text" name="PG-name" id="PG-name" placeholder="Nome" pattern="^[a-zA-Z]{1,9}$" required autocomplete="off" title="Dalle 3 alle 10 lettere">
					<div class="character-choose">
						<div id="prevPG" class="arrow">←</div>
						<img id="imagePG" class="always-animated" src="" alt="" draggable="false">
						<div id="nextPG" class="arrow">→</div>
					</div>
					<hr>
					<footer>
						<div class="damage-box">
							<p>Danno</p>
							<p id="damage"></p>
						</div>
						<div class="element-pic">
							<input type="radio" value="" name="element" id="element" checked hidden>
							<img id="elementPic" draggable="false" src="" alt="">
    	        		</div>
						<div class="dodge-box">
							<p>Schivata</p>
							<p id="dodge"></p>
						</div>
					</footer>
				</div>
			</div>
			<div class="info-section">
				<div class="prevalence-box">
					<div class="prevalence-block prevails">
						<p>Prevale</p>
						<div class="element-pic">
    	            		<img id="prevalePic" draggable="false" src="" alt="">
    	        		</div>
					</div>
					<div class="prevalence-block prevailed">
						<p>Prevalso</p>
						<div class="element-pic">
    	            		<img id="prevalsoPic" draggable="false" src="" alt="">
    	        		</div>
					</div>
				</div>
				<div class="button-container">
					<button id="createPG" type="submit" disabled>Crea</button>
					<button id="backToDash" type="button">Annulla</button>
				</div>
			</div>

		</form>
	</main>
</body>
</html>