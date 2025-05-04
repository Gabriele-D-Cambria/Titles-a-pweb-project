<?php
require_once "methods.php";
session_start();

if(!isset($_SESSION['account']))
	pageError(401);

if(!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== "POST"){
	pageError(403);
}

//TODO: fai la creazione
print_r($_POST);


?>