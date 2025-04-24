<?php
session_start();
session_unset();
require_once "methods.php";

if(!isset($_SERVER['REQUEST_METHOD'])){
    pageError("403");
    exit;
}
elseif($_SERVER["REQUEST_METHOD"] == "POST"){
    $username = $_POST["username"] ?? '';
    $password = $_POST["password"] ?? '';
    $confirmPassword = $_POST["confirmPassword"] ?? '';

    $isLogin = empty($confirmPassword);

    $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
    if($conn->connect_error){
        terminateLogin("connection_failed", $isLogin);
    }

    $errorType = validateInputs($username, $password, $confirmPassword);

    if(!empty($errorType)){
        $conn->close();
        terminateLogin($errorType, $isLogin);
    }

    if(empty($confirmPassword)){
        $stmt = $conn->prepare("SELECT * FROM Account WHERE Username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();

        if($result->num_rows === 0){
            $conn->close();
            terminateLogin("username_not_found", $isLogin);
        }
        else{
            $data = $result->fetch_assoc();
            $hashedPassword = $data['Password'];

            if(password_verify($password, $hashedPassword)){
                $conn->close();
                startSession($username);
            }
            else{
                $conn->close();
                terminateLogin("wrong_password", $isLogin);
            }
        }
    }
    else{
        $stmt = $conn->prepare("SELECT ID FROM Account WHERE Username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();

        if($stmt->num_rows() > 0){
            $stmt->close();
            $conn->close();
            terminateLogin("username_taken", $isLogin);
        }
        else{
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $conn->prepare("INSERT INTO Account (Username, Password) VALUES (?, ?)");
            $stmt->bind_param("ss", $username, $hashedPassword);

            if($stmt->execute()){
                $stmt->close();
                $conn->close();
                startSession($username);
            }
            else{
                $stmt->close();
                $conn->close();
                terminateLogin("registration_failed", $isLogin);
            }
        }
    }
    
    
}
else{
    pageError("403");
}

function startSession($username){
    $account = getData($username);
    $_SESSION['account'] = serialize($account);
    
    header("Location: dashboard.php");
    exit();
}