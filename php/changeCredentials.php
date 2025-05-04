<?php
require_once "methods.php";

session_start();

if(!isset($_SERVER['REQUEST_METHOD']) || basename($_SERVER['HTTP_REFERER']) !== 'dashboard.php'){
	pageError("403");
}
if (!isset($_SESSION['account'])) {
	pageError("401");
}

$account = unserialize($_SESSION['account']);

$conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
if($conn->connect_error){
	terminateChangeError("connection_failed");
}

$logout = true;
$stmtCheck = null;
$stmtUpdate = null;

$conn->begin_transaction();
try{
	if(isset($_POST['username'])){
		// Cambio username
		$logout = false;
		$newUsername = $_POST['username'];

		$errorType = validateInputs($newUsername, VALID_PASSWORD, VALID_PASSWORD);

		if(!empty($errorType)){
			throw new Exception($errorType);
		}

		// Verifico non sia uguale a quello attuale
		if($newUsername === $account->getUsername()){
			throw new Exception("username_same_as_current");
		}

		$sqlCheck = "SELECT ID
				FROM Account
				WHERE Username = ?";

		$stmtCheck = $conn->prepare($sqlCheck);
		$stmtCheck->bind_param("s", $newUsername);
		if(!$stmtCheck->execute()){
			throw new Exception($stmtCheck->error);
		}
		$result = $stmtCheck->get_result();

		if($result->num_rows > 0){
			throw new Exception("username_taken");
		}


		$sqlUpdate = "UPDATE Account SET Username = ? WHERE ID = ?";

		$stmtUpdate = $conn->prepare($sqlUpdate);
		$stmtUpdate->bind_param("si", $newUsername, $account->getId());
		if(!$stmtUpdate->execute()){
			throw new Exception($stmtUpdate->error);
		}

		$account->updateUsername($newUsername);
		$message = "Username aggiornato correttamente";
	}
	else if(isset($_POST['password']) && isset($_POST['confirmPassword'])){
		// Cambio Password
		$newPassword = $_POST['password'];
		$confirmPassword = $_POST['confirmPassword'];

		$errorType = validateInputs(VALID_USERNAME, $newPassword, $confirmPassword);

		if(!empty($errorType)){
			throw new Exception($errorType);
		}

		// Verifico non sia uguale a quella attuale
		$sqlCheck = "SELECT Password
					 FROM Account
					 WHERE ID = ?";

		$stmtCheck = $conn->prepare($sqlCheck);
		$stmtCheck->bind_param('i', $account->getId());
		if(!$stmtCheck->execute()){
			throw new Exception($stmtCheck->error);
		}
		$result = $stmtCheck->get_result();

		$currentPassword = $result->fetch_assoc();

		if(password_verify($newPassword, $currentPassword["Password"])){
			terminateChangeError("password_same_as_current");
		}

		$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

		$sqlUpdate = "UPDATE Account SET Password = ? WHERE ID = ?";
		$stmtUpdate = $conn->prepare($sqlUpdate);
		$stmtUpdate->bind_param('si', $hashedPassword, $account->getId());

		if(!$stmtUpdate->execute()){
			throw new Exception($stmtUpdate->error);
		}

		$message = "Password aggiornata correttamente. \n Effettuare nuovamente il login";
	}
	else if(isset($_POST['deleteCheck'])){
		// Elimina Account

		$password = $_POST['password'];

		$errorType = validateInputs(VALID_USERNAME, $password, $password);

		if(!empty($errorType)){
			throw new Exception($errorType);
		}

		$sqlCheck = "SELECT Password
					 FROM Account
					 WHERE ID = ?";

		$stmtCheck = $conn->prepare($sqlCheck);
		$stmtCheck->bind_param('i', $account->getId());
		if(!$stmtCheck->execute()){
			throw new Exception($stmtCheck->error);
		}
		$result = $stmtCheck->get_result();

		$currentPassword = $result->fetch_assoc();

		if(!password_verify($password, $currentPassword["Password"])){
			terminateChangeError("wrong_password_on_delete");
		}

		$sqlDelete = "DELETE FROM Account WHERE ID = ?";
		$stmtDelete = $conn->prepare($sqlDelete);
		$stmtDelete->bind_param('i', $account->getId());
		if (!$stmtDelete->execute()) {
			throw new Exception($stmtDelete->error);
		}

		$message = "Account eliminato con successo";
	}
	else if(isset($_POST['newPic'])){
		$logout = false;
		$newPath = $_POST['newPic'];
		
		$sql = "SELECT ImmagineProfilo
				FROM Account
				WHERE ID = ?";
		$stmtCheck = $conn->prepare($sql);
		$stmtCheck->bind_param("s", $account->getId());
		if(!$stmtCheck->execute()){
			throw new Exception($stmtCheck->error);
		}

		$result = $stmtCheck->get_result();
		$currentPath = $result->fetch_assoc();
		if($currentPath['ImmagineProfilo'] === $newPath){
			throw new Exception('image_same_as_current');
		}

		$sqlUpdate = "UPDATE Account SET ImmagineProfilo = ? WHERE ID = ?";
		
		$stmtUpdate = $conn->prepare($sqlUpdate);
		$stmtUpdate->bind_param("si", $newPath, $account->getId());
		if(!$stmtUpdate->execute()){
			throw new Exception($stmtUpdate->error);
		}

		$account->updateImmagineProfilo($newPath);
		$message = "Immagine cambiata con successo!";
	}
	else{
		throw new Exception("invalid_param");
	}

	$_SESSION['account'] = serialize($account);
	$conn->commit();
	terminateChange($logout,$message);
}
catch(Exception $e){
	$conn->rollback();
	terminateChangeError($e->getMessage());
}
finally{
	if($stmtCheck)	$stmtCheck->close();
	if($stmtUpdate)	$stmtUpdate->close();
	$conn->close();
}


function terminateChangeError($errorType){
	error_log($errorType);

	$errorMessage = ERROR_TYPES[$errorType] ?? "Errore Sconosciuto";
	$_SESSION['message'] = $errorMessage;

	header("Location: dashboard.php");
	exit();
}

function terminateChange($logout, $message){
	$direction = $logout? "logout.php" : "dashboard.php";

	$_SESSION["message"] = $message;
	header("Location: ". $direction);
	exit();
}
?>