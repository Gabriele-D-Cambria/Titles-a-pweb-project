<?php

session_start();

if(!isset($_SESSION['account']) || !isset($_SESSION['currentPG_nome'])){
	pageError(401);
}

$message= null;
if(isset($_SESSION['message'])){
	$message = $_SESSION['message'];
	unset($_SESSION['message']);
}

$errorMessage= null;
if(isset($_SESSION['errorMessage'])){
	$errorMessage = $_SESSION['errorMessage'];
	unset($_SESSION['errorMessage']);
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
	<base href="http://localhost/cambria_672642/">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Titles</title>
	<link rel="icon" href="images/icon.svg" type="image/svg+xml" sizes="16x16" >
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="css/gamePage.css">
	<link rel="stylesheet" href="css/personaggio.css">
	<link rel="stylesheet" href="css/inventory.css">
	<script type="module" src="js/gamePage.js"></script>
	<script>
		const message = <?php echo json_encode($message)?>;
		const errorMessage = <?php echo json_encode($errorMessage)?>;
	</script>
	<meta charset="UTF-8">
</head>
<body>
	<header>
        <h1><i>Titles</i></h1>
        <aside>
            <button id="giveUpBtn">Arrenditi</button>
        </aside>
    </header>
	<main>
		<div id="imageContainer"></div>
		<aside class="actionSection">
			<div class="action-block">
				<div class="timer-section">
					<span id="timer">00:00</span>
				</div>
				<button id="attackBtn" class="attacco">Attacca</button>
				<div class="bag-section">
					<div class="item-container">
						<div id="obj_0" class="item-slot bag-item">
						</div>
					</div>
					<div class="item-container">
						<div id="obj_1" class="item-slot bag-item">
						</div>
					</div>
					<div class="item-container">
						<div id="obj_2" class="item-slot bag-item selected-item">
						</div>
					</div>
				</div>
			</div>
		</aside>
	</main>
</body>
</html>