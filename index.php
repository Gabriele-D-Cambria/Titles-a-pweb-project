<?php

session_start();

$message = null;
$loginError = null;

if(isset($_SESSION["loginError"])){
    $loginError = $_SESSION["loginError"];
    unset($_SESSION["loginError"]);
}

if(isset($_SESSION["message"])){
    $message = $_SESSION["message"];
    unset($_SESSION["message"]);
}
?>


<!DOCTYPE html>
<html lang="it">
<head>
    <base href="http://localhost/cambria_672642/">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/index.css">
    <link rel="icon" href="images/items/weapons/acqua.svg" type="image/svg+xml" sizes="any" >
    <script type="module" src="js/index.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
        const loginError = <?php echo json_encode($loginError); ?>;
        const message = <?php echo json_encode($message)?>;
    </script>
    <title>Titles</title>
</head>
<body>
    <header>
        <h1><i>Titles</i></h1>
        <aside>
            <button id="loginBtn">Login</button>
            <button id="registerBtn">Sign Up</button>
        </aside>
    </header>

    <section class="intro">
        <div class="context">
            <h2>Benvenuto in <i>Titles</i></h2>
            <p>**TESTO DA INSERIRE**</p> <!-- TODO: testo da inserire -->
        </div>
    </section>

    <section class="commands">
        <div class="slider">            <!-- TODO: ! Immagini Slider da Implementare -->
        </div>
        <div class="info">
            <h3>Comandi di Gioco</h3>
            <p>
                Testo da mettere
                <!-- TODO: testo per i comandi -->
                <!-- TODO: sistema i messaggi dove ERROR_TYPES[$errorType] ?? $errorType con il default message -->
            </p>
        </div>

    </section>
    <footer class="footer">
        <a href="documentazione.html"> Documentazione HTML</a>
        <p>Creato da <i>Gabriele Domenico Cambria - mat. 672642</i></p>
    </footer>
    <div id="loginModule" class="module">
    </div>
</body>
</html>
