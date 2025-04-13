<?php
    session_start();

    require_once "./php/methods.php";

    if(!isset($_SESSION["path"])){
        $_SESSION["path"] = setPath();
    }
    echo $_SESSION["path"];
    $error = isset($_GET["error"]) ? $_GET["error"] : null;
    $isLogin = isset($_GET["isLogin"]) ? ($_GET["isLogin"] === 'true' || $_GET["isLogin"] === '1') : null;
?>


<!DOCTYPE html>
<html lang="it">
<head>
    <base href="<?php echo $_SESSION["path"];?>">
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/style.css">
    <script type="module" src="js/index.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
        const error = "<?php echo $error; ?>";
        const isLogin = <?php echo json_encode($isLogin); ?>;
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
            </p>
        </div>

    </section>
    <div id="loginModule" class="module">
    </div>
</body>
</html>
