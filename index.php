<?php

session_start();

require_once "./php/methods.php";

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Titles</title>
    <link rel="icon" href="images/icon.svg" type="image/svg+xml" sizes="16x16" >
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/index.css">
    <script type="module" src="js/index.js"></script>
    <script>
        const loginError = <?php echo json_encode($loginError); ?>;
        const message = <?php echo json_encode($message)?>;
    </script>
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
    <div id="loginModule" class="module"></div>
</body>
</html>
