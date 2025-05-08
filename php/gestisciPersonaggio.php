<?php

require_once "methods.php";
session_start();

if($_SERVER['REQUEST_METHOD'] === "POST" && isset($_POST['pg'])) {
    $_SESSION['currentPG_nome'] = serialize($_POST['pg']);
	header("Location: gestisciPersonaggio.php");
	exit;
}

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome'])){
	pageError(401);
}

$account = unserialize($_SESSION['account']);
$personaggi = $account->getPersonaggi();

$PG_name = unserialize($_SESSION['currentPG_nome']);

$currentPGobj = null;

foreach($personaggi as $pg){
	if($pg->getNome() === $PG_name){
		$currentPGobj = $pg;
		break;
	}
}

if(!$currentPGobj){
	pageError(400);
}

$currentPG = $currentPGobj->getAll();
$prevalenceImg = $currentPGobj->getImmaginiPrevalenza();
?>

<!DOCTYPE html>
<html lang="it">
<head>
	<base href="http://localhost/cambria_672642/">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Titles</title>
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="css/menu.css">
	<link rel="stylesheet" href="css/personaggio.css">
	<script type="module" src="js/gestisciPersonaggio.js"></script>	
</head>
<body>
	<header>
        <h1><i>Titles</i></h1>
        <div>
            <form action="php/logout.php" method="POST">
                <button type="submit">Logout</button>
            </form>
        </aside>
    </header>
	<main class="main-section">
		<form class="form-box" action="php/handlePG.php" method="POST">
			<div class="stats-section">
				<div class="lvl-block">
					<p class="lvl-info">Livello <span id="user-lvl">
						<?php echo $currentPG["livello"];?>
					</span></p>
					<p class="pu-info">PU: <span id="PU-points">
						<?php echo $currentPG["puntiUpgrade"];?>
					</span></p>
					<div class="exp-bar">
						<div class="exp-points" style="width: <?php echo $currentPG["exp"];?>%;"></div>
					</div>
				</div>
				<div class="stats-block PF">
					<div class="PF-points-block">
						<div id="lessPF" class="clickable">-</div>
						<div id="PF" class="PF-amount">
							<?php echo $currentPG["PF"];?>
						</div>
						<div id="morePF" class="clickable">+</div>
					</div>
					<p>PF</p>
				</div>
				<div class="stats-block FOR">
					<div class="FOR-points-block">
						<div id="lessFOR" class="clickable">-</div>
						<div id="FOR" id="FOR-amount">
							<?php echo $currentPG["FOR"];?>
						</div>
						<div id="moreFOR" class="clickable">+</div>
					</div>
					<p>FOR</p>
				</div>
				<div class="stats-block DES">
					<div class="DES-points-block">
						<div id="lessDES" class="clickable">-</div>
						<div id="DES" class="DES-amount">
							<?php echo $currentPG["DES"];?>
						</div>
						<div id="moreDES" class="clickable">+</div>
					</div>
					<p>DES</p>
				</div>
				<div class="sendUpgrades">
					<button id="upgradeStats" disabled>Modifica</button>
				</div>
			</div>
			<div class="character-section">
				<div class="character-box">
					<input type="text" name="PG-name" id="PG-name" value="<?php echo $currentPG["nome"];?>" disabled>
					<img id="deletePG" src="images/trash.svg" alt="Elimina Personaggio" title="Elimina Personaggio">
					<div class="character-choose">
						<!-- <div id="prevPG" class="arrow">←</div> -->
						<img id="imagePG" src="<?php echo $currentPG["pathImmaginePG"];?>" alt="" draggable="false">
						<!-- <div id="nextPG" class="arrow">→</div> -->
					</div>
					<hr>
					<footer>
						<div class="damage-box">
							<p>Danno</p>
							<p id="damage">
								<?php echo $currentPG["damage"];?>
							</p>
						</div>
						<div class="element-pic">
							<img id="elementPic" draggable="false" src="<?php echo $currentPG["pathImmagine"];?>" alt="Element Pic">
    	        		</div>
						<div class="dodge-box">
							<p>Schivata</p>
							<p id="dodge">
								<?php echo $currentPG["dodgingChance"];?>%
							</p>
						</div>
					</footer>
				</div>
			</div>
			<div class="info-section">
				<div class="prevalence-box">
					<div class="prevalence-block prevails">
						<p>Prevale</p>
						<div class="element-pic">
    	            		<img id="prevalePic" draggable="false" 
							src="<?php echo $prevalenceImg["prevaleSu"];?>" 
							alt="Immagine Prevale su">
    	        		</div>
					</div>
					<div class="prevalence-block prevailed">
						<p>Prevalso</p>
						<div class="element-pic">
    	            		<img id="prevalsoPic" draggable="false" 
							src="<?php echo $prevalenceImg["prevalsoDa"];?>" 
							alt="Immagine Prevalso da">
    	        		</div>
					</div>
				</div>
				
			</div>

		</form>
	</main>
	<div id="deleteModule" class="module"></div>
</body>
</html>