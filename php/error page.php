<?php
    session_start();
    require_once('methods.php');

    if(!isset($_GET['error_code'])){
        pageError("403");
    }
    $errorCode = $_GET['error_code'];
    switch($errorCode){
        case '400':
            $title = '400 Bad Request';
            $paragrafo = "La richiesta è stata formulata male o non è valida.";
            $bottone ="Torna alla <i>home page</i>";
            break;
        case "401":
            $title = '401 Unauthorized';
            $paragrafo = "Devi essere loggato per poter accedere a questa pagina.";
            $bottone = "Torna alla <i>home page</i> per il login.";
            break;
        case '403':
            $title = '403 Forbidden';
            $paragrafo = "Non hai il permesso di accedere a questa pagina.";
            $bottone = "Ritorna alla <i>home page</i>";
            break;
        case '500':
            $title = '500 Internal Server Error';
            $paragrafo = "Ci scusiamo per il disagio, ma il server non è al momento disponibile.</p><p> Per favore, provare più tardi..";
            $bottone = "Ritorna alla <i>home page</i>";
            break;
        default:
            pageError("400");
    }
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <base href="http://localhost/cambria_672642/">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/errorPage.css">
    <title><?php echo $title?></title>
</head>
<body>
    <header style="flex-direction:column">
        <h1><?php echo $title ?></h1>
    </header>
    <div class="dialog-message">
        <main>
            <p><?php echo $paragrafo?></p>
            <a href="index.php"><button><?php echo $bottone?></button></a>
        </main>
    </div>
</body>
</html>
