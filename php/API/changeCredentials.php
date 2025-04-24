<?php
session_start();
require_once "../methods.php";

if(!isset($_SERVER['REQUEST_METHOD']) || basename($_SERVER['HTTP_REFERER']) !== 'dashboard.php'){
	pageError("403", "../");
}
if (!isset($_SESSION['account']) ) {
	pageError("401", "../");
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
if($conn->connect_error){
	terminateChange("connection_failed");
}

try{

	if(isset($_POST['username'])){
		// Cambio username
		$username = $_POST['username'];
	
		$errorType = validateInputs($username, VALID_PASSWORD, VALID_PASSWORD);
	
		if(!empty($errorType)){
			terminateChange($errorType);
		}
	
	
	
		echo $username;
	}
	else if(isset($_POST['password']) && isset($_POST['confirmPassword'])){
		// Cambio Password
		$password = $_POST['password'];
		$confirmPassword = $_POST['confirmPassword'];
	
		$errorType = validateInputs(VALID_USERNAME, $password, $confirmPassword);
	
		if(!empty($errorType)){
			terminateChange($errorType);
		}
	
		echo $password . "\n";
		echo $confirmPassword;
	}
	else if(isset($_POST['deleteCheck'])){
		// Elimina Account
	
		echo  $_POST['deleteCheck'];
	}
}
catch(Exception $e){
	terminateChange($e->getMessage());
}
finally{
	$conn->close();
}


function terminateChange($errorType){
//TODO implementa la funzione in modo che torni alla dashboard e invii un messageBox con l'errore.
}


?>