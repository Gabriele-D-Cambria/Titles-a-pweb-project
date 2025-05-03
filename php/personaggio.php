<?php
session_start();

require_once "methods.php";

if(!isset($_SESSION['account'])){
	pageError("401");
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
	<base href="http://localhost/cambria_672642/">
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Titles</title>
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="css/personaggio.css">
	<script type="module" src="js/personaggio"></script>
</head>
<body>
	<header>
        <h1><i>Titles</i></h1>
        <aside>
            <form action="php/logout.php" method="POST">
                <button type="submit">Logout</button>
            </form>
        </aside>
    </header>
	Sdrogo
</body>
</html>