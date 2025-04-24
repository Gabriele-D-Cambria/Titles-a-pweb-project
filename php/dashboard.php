<?php
session_start();
//! ini_set("display_errors", "0");
require_once "methods.php";

if(!isset($_SESSION['account'])){
    pageError("401");
}

$account = unserialize($_SESSION['account']);
$user = $account->getAll();

// $user["personaggi"][] = 1;
$characterList = "";
foreach ($user["personaggi"] as $character){
    $characterList .= '<div class="character-item">';
    $characterList .= "Personaggio che sborra\n";
    $characterList .= '</div>';
}

$addCharacterButton = (count($user["personaggi"]) != Account::MAX_NUM_PERSONAGGI)? 
'<div id="add-character">Aggiungi un personaggio</div>':
" ";
            
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <base href="http://localhost/cambria_672642/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/inventory.css">
    <link rel="stylesheet" href="css/shop.css">
    <link rel="stylesheet" href="css/menu.css">
    <script type="module" src="js/dashboard.js"></script>
    <script>
        const USERNAME = "<?php echo $user["username"]?>";
    </script>
    <title>Dashboard</title>
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
    <div class="top-section">
        <img id="menu" src="images/menu.svg" alt="menu item" class="clickable">
        <div class="user-info">
            <div class="user-pic">
                <img src="images/profilepic.svg" alt="Profile Pic">
            </div>
            <div class="username-box">
                <p><?php echo $user['username'];?></p>
            </div>
    </div> 
        <div class="coin-display">
            <img src="images/coin.svg" alt="coin image">
            <span id="coin-count"><?php echo $user['monete']; ?></span>
        </div>
    </div>
    <main class="main-section">
        <aside class="character-list" style="grid-template-rows: repeat(<?php echo count($user["personaggi"])?>, 3em) 1fr;">
            <?php echo $characterList; ?>
            <?php echo $addCharacterButton; ?>
        </aside>
        <aside class="button-container">
            <div id="inventory-btn" class="button inventory-button">
                <img src="images/inventoryPic.svg" alt="Immagine Inventario">
                <p>Inventario</p>
            </div> 
            <div id="shop-btn" class="button shop-button">
                <img src="images/shopPic.svg" alt="Immagine Shop">
                <p>Negozio</p>
            </div> 
        </aside>
    </main>
    <div id="menuModule" class="module"></div>
    <div id="inventoryModule" class="module"></div>
    <div id="shopModule" class="module"></div>
</body>
</html>