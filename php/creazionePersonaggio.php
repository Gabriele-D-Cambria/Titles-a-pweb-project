<?php
session_start();

require_once "methods.php";

if(!isset($_SESSION['account'])){
	pageError("401");
}

?>

<!DOCTYPE html>
<html lang="it">
<head>
	<base href="http://localhost/cambria_672642/">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Titles</title>
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="css/personaggio.css">
	<script type="module" src="js/creazionePersonaggio.js"></script>
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
		<form class="form-box" action="php/createPG.php" method="POST">
			<div class="stats-section">
				<div class="lvl-block">
					<p class="lvl-info">Livello <span id="user-lvl">1</span></p>
					<!-- <p class="pu-info">PU: <span id="PU-points">1</span></p> -->
					<div class="exp-bar">
						<div class="exp-points" style="width: 60%;"></div>
					</div>
				</div>
				<div class="stats-block PF">
					<div id="PF" class="PF-points">25</div>
					<p>PF</p>
				</div>
				<div class="stats-block FOR">
					<div id="FOR" class="FOR-points">0</div>
					<p>FOR</p>
				</div>
				<div class="stats-block DES">
					<div id="DES" class="DES-points">0</div>
					<p>DES</p>
				</div>
			</div>
			<div class="character-section">
				<div class="character-box">
					<input type="text" name="PG-name" id="PG-name" placeholder="Nome" pattern="^[a-zA-Z][a-z]{2,15}$" required autocomplete="off">
					<div class="character-choose">
						<div id="prevPG" class="arrow">←</div>
						<img src="images/characters/acqua.svg" alt="Personaggio d'Acqua" draggable="false">
						<div id="nextPG" class="arrow">→</div>
					</div>
					<hr>
					<footer>
						<div class="damage-box">
							<p>Danno</p>
							<p>5</p>
						</div>
						<div class="element-pic">
							<input type="radio" value="acqua">
							<label for="chosen">
								<img id="elementPic" draggable="false" src="images/pics/acqua.svg" alt="Element Pic">
							</label>
    	        		</div>
						<div class="dodge-box">
							<p>Schivata</p>
							<p id="dodge">50%</p>
						</div>
					</footer>
				</div>
			</div>
			<div class="info-section">
				<div class="prevalence-box">
					<div class="prevalence-block prevails">
						<p>Prevale</p>
						<div class="element-pic">
    	            		<img id="prevalePic" draggable="false" src="images/pics/fuoco.svg" alt="Elemento Prevalso">
    	        		</div>
					</div>
					<div class="prevalence-block prevailed">
						<p>Prevalso</p>
						<div class="element-pic">
    	            		<img id="prevalsoPic" draggable="false" src="images/pics/elettro.svg" alt="Elemento Prevalso">
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