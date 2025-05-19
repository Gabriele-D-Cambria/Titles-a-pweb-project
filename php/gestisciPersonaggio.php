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

$currentPGobj = $account->getPersonaggi($PG_name);

if(!$currentPGobj){
	pageError(400);
}

$currentPG = $currentPGobj->getAll();
$prevalenceImg = $currentPGobj->getImmaginiPrevalenza();

$errorMessage = null;
if(isset($_SESSION["errorMessage"])){
	$errorMessage = $_SESSION["errorMessage"];
	unset($_SESSION["errorMessage"]);
}

$message = null;
if(isset($_SESSION["message"])){
	$message = $_SESSION["message"];
	unset($_SESSION["message"]);
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="icon" href="./../images/icon.svg" type="image/svg+xml" sizes="16x16" >
	<title>Titles</title>
	<link rel="stylesheet" href="./../css/style.css">
	<link rel="stylesheet" href="./../css/menu.css">
	<link rel="stylesheet" href="./../css/personaggio.css">
	<link rel="stylesheet" href="./../css/inventory.css">
	<link rel="stylesheet" href="./../css/pgAnimations.css">
	<script type="module" src="./../js/gestisciPersonaggio.js"></script>
	<script>
		const errorMessage = <?php echo json_encode($errorMessage)?>;
		const message = <?php echo json_encode($message)?>;
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
		<div class="page-box">
			<form class="stats-section" action="./handlePG.php" method="POST">
				<input type="radio" name="upgrade" checked hidden>
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
						<div id="less-PF" class="statsButton">-</div>
						<div class="PF-amount PD-amount">
							<input type="number" id="PF" name="PF"
								value="<?php echo $currentPG["PF"];?>"
								readonly>
								<pre> + </pre>
							<input type="number" id="PD" name="PD"
								value="<?php echo $currentPG["protezioneDanno"];?>"
								readonly disabled>
						</div>
						<div id="more-PF" class="statsButton">+</div>
					</div>
					<p>PF + PD</p>
				</div>
				<div class="stats-block FOR">
					<div class="FOR-points-block">
						<div id="less-FOR" class="statsButton">-</div>
						<input type="number" id="FOR" name="FOR"
							value="<?php echo $currentPG["currentFOR"];?>"
							readonly>
						<div id="more-FOR" class="statsButton">+</div>
					</div>
					<p>FOR</p>
				</div>
				<div class="stats-block DES">
					<div class="DES-points-block">
						<div id="less-DES" class="statsButton">-</div>
						<input type="number" id="DES" name="DES"
							value="<?php echo $currentPG["currentDES"];?>"
							readonly>
						<div id="more-DES" class="statsButton">+</div>
					</div>
					<p>DES</p>
				</div>
				<div class="sendUpgrades">
					<button type="submit" id="upgradeStats" disabled>Migliora Statistiche</button>
				</div>
			</form>
			<div class="character-section">
				<div class="character-box">
					<input type="text" name="PG-name" id="PG-name" value="<?php echo $currentPG["nome"];?>" disabled>
					<img id="deletePG" src="./../images/trash.svg" alt="Elimina Personaggio" title="Elimina Personaggio">
					<div class="character-choose">
						<img id="imagePG" class="sometimes-animated"
						 	src="./../<?php echo $currentPG["pathImmaginePG"];?>" 
							alt="Immagine Personaggio" draggable="false">
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
							<img id="elementPic" draggable="false" src="./../<?php echo $currentPG["pathImmagine"];?>" alt="Element Pic"
							title="<?php echo $currentPG["elemento"]?>">
    	        		</div>
						<div class="dodge-box">
							<p>Schivata</p>
							<p id="dodge">
								<?php echo $currentPG["dodgingChance"];?>%
							</p>
						</div>
					</footer>
				</div>
				<form class="play-box" method="POST" action="">
					<button type="submit">Gioca</button>
					<button id="backToDash">Home</button>
				</form>
			</div>
			<div class="info-section">
				<div class="prevalence-box">
					<div class="prevalence-block prevails">
						<p title="Il danno inflitto su questo elemento aumenta di 1 punto">Prevale</p>
						<div class="element-pic">
    	            		<img id="prevalePic" draggable="false"
							src="./../<?php echo $prevalenceImg["prevaleSu"];?>"
							alt="Immagine Prevale su <?php echo $currentPG["prevaleSu"]?>"
							title="<?php echo $currentPG["prevaleSu"]?>">
    	        		</div>
					</div>
					<div class="prevalence-block prevailed">
						<p title="La probabilità di schivare contro questo elemento è dimezzata">Prevalso</p>
						<div class="element-pic">
    	            		<img id="prevalsoPic" draggable="false"
							src="./../<?php echo $prevalenceImg["prevalsoDa"];?>"
							alt="Immagine Prevalso da <?php echo $currentPG["prevalsoDa"]?>"
							title="<?php echo $currentPG["prevalsoDa"]?>">
    	        		</div>
					</div>
				</div>
				<div class="zaino-section">
					<div class="equipment-section">
						<p>Arma</p>
						<p>Armatura</p>
						<div class="item-container">
							<div id="arma" class="item-slot bag-item"></div>
						</div>
						<div class="item-container">
							<div id="armatura" class="item-slot bag-item"></div>
						</div>
					</div>
					<div class="bag-section">
						<p>Oggetti</p>
						<div class="item-container">
							<div id="obj_0" class="item-slot bag-item"></div>
						</div>
						<div class="item-container">
							<div id="obj_1" class="item-slot bag-item"></div>
						</div>
						<div class="item-container">
							<div id="obj_2" class="item-slot bag-item"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
	<div id="deleteModule" class="module"></div>
	<div id="inventoryModule" class="module"></div>
	<div id="remove-item-menu" class="context-menu"></div>
</body>
</html>