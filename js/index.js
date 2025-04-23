"use strict";

import {closeModule, showModule} from './methods.js'

let moduleListener = null;
const LOGIN_PAGE = "php/login.php";
const USERNAME_PATTERN = "^[a-zA-Z][a-zA-Z0-9_.]{2,9}$";
//? source: https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
const PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$";
//? endsource




document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").addEventListener("click", () => {
       createModule(true);
    });
    document.getElementById("registerBtn").addEventListener("click", () => {
        createModule(false);
     });

    if(error){
        handleError(error, isLogin);
     }

});

function createModule(login) {
    let module = document.getElementById("loginModule");

    let container = document.createElement("div");
    container.classList.add("module-container");
    let title = document.createElement("h2");
    title.innerText = (login)? "Login" : "Sign Up";
    container.appendChild(title);

    let form = document.createElement("form");

    form.method = "POST";
    form.action = LOGIN_PAGE;

    // Username
    let label = document.createElement("label");
    let input = document.createElement("input");
    
    label.for = "username";
    label.innerText = "Username:";
    input.type = "text";
    input.id = input.name = "username";
    input.toggleAttribute("required", true);

    input.pattern = USERNAME_PATTERN;
    input.title = "Deve iniziare con una lettera e avere tra 3 e 10 caratteri (lettere, punti o underscore).";
    input.placeholder = "User.0_";
    input.autocomplete = "off";

    input.addEventListener("input", validateForm);

    form.appendChild(label);
    form.appendChild(input);

    // Password
    label = document.createElement("label");
    label.for = "password";
    label.innerText = "Password:";
    
    let passwordContainer = document.createElement("div");
    passwordContainer.classList.add("password-container");
    
    input = document.createElement("input");
    input.type = "password";
    input.id = input.name = "password";
    input.toggleAttribute("required", true);
    input.pattern = PASSWORD_PATTERN;
    
    input.title = "Massimo 15 caratteri, deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale.";
    
    input.placeholder = "Password";
    input.addEventListener("input", validateForm);

    passwordContainer.appendChild(input);
    
    let toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.innerText = "Mostra";
    toggleBtn.classList.add("toggle-password");
    toggleBtn.addEventListener("click", (e) => {
        hideShow(e);
    });
    passwordContainer.appendChild(toggleBtn);
    
    form.appendChild(label);
    form.appendChild(passwordContainer);

    // Conferma Password
    if(!login){
        
        label = document.createElement("label");
        label.for = "confirmPassword";
        label.innerText = "Conferma Password:";

        passwordContainer = document.createElement("div");
        passwordContainer.classList.add("password-container");

        input = document.createElement("input");
        input.type = "password";
        input.id = input.name = "confirmPassword";
        input.toggleAttribute("required", true);
        input.classList.toggle("invalid", true);
        input.title = "Deve essere uguale alla password";

        input.placeholder = "Conferma";
        input.addEventListener("input", validateForm);
        
        passwordContainer.appendChild(input);
        
        toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.innerText = "Mostra";
        toggleBtn.classList.add("toggle-password");
        toggleBtn.addEventListener("click", (e) => {
            hideShow(e, true);
        });

        
        passwordContainer.appendChild(toggleBtn);
        
        form.appendChild(label);
        form.appendChild(passwordContainer);
    }

    
    container.appendChild(form);
    let btn = document.createElement("button");

    btn.type = "submit";
    btn.id = "submit";
    btn.innerText = "Accedi";
    btn.toggleAttribute("disabled", true);

    form.appendChild(btn);
    btn = document.createElement("button");
    
    btn.type = "button";
    btn.id = "closeModule";
    btn.innerText = "Chiudi";
    btn.addEventListener("click", (e) => {
        if(moduleListener === null)
            return;
        if(closeModule(e, "loginModule", true)){
            window.removeEventListener("click", moduleListener);
            moduleListener = null;
        }
        });
    
    form.appendChild(btn);

    let p = document.createElement("p");
    p.innerText = (login)? "Non hai un'account? " : "Hai già un'account? ";

    let a = document.createElement("a");
    a.innerText = (login)? "Registrati" : "Accedi";
    a.id = (login)? "register" : "login";
    
    a.addEventListener("click", (e) => {
        closeModule(null, "loginModule", true);
        moduleListener = null;
        createModule(e.target.id === "login");
    });

    p.appendChild(a);
    container.appendChild(p);
    
    module.appendChild(container);
    
    showModule(module.id);

    
    moduleListener = (e) => {closeModule(e, "loginModule")};
    window.addEventListener("click", moduleListener);

    
}

    
function validateForm(){
    let usr = document.getElementById("username");
    let psw = document.getElementById("password");
    let psw2 = document.getElementById("confirmPassword");
    let btn = document.getElementById("submit");
    let invalid = false;

    if(psw2 !== null){
        if(psw2.value === psw.value && psw.value !== ""){
            psw2.classList.toggle("invalid", false);
            psw2.classList.toggle("valid", true);
        }
        else{
            psw2.classList.toggle("valid", false);
            psw2.classList.toggle("invalid", true);
            invalid = true;
        }
    }

    if(!usr.checkValidity() || !psw.checkValidity()){
        invalid = true;
    }
        
    
    btn.toggleAttribute("disabled", invalid);
}

function hideShow(e, confirm = false){
    let input;
    input = document.getElementById((confirm)? "confirmPassword" : "password");

    if (input.type === "password") {
        input.type = "text";
        e.target.innerText = "Nascondi";
    } else {
        input.type = "password";
        e.target.innerText = "Mostra";
    }
}


function handleError(error, isLogin){
    let errorMessage = "";

    switch (error) {
        case "username_taken":
            errorMessage = "Username già esistente.";
            break;
        case "invalid_username":
            errorMessage = "Username non valido. Deve iniziare con una lettera e avere tra 3 e 10 caratteri.";
            break;
        case "invalid_password":
            errorMessage = "Password non valida. Deve contenere almeno 8 caratteri e non più di 15, una lettera maiuscola, una minuscola, un numero e un carattere speciale.";
            break;
        case "password_mismatch":
            errorMessage = "Le password non corrispondevano.";
            break;
        case "registration_failed":
            errorMessage = "Registrazione fallita. Riprova.";
            break;
        case "connection_failed":
            errorMessage = "Il server non è al momento disponibile. \n Riprovare tra un po'.";
            break;
        case "username_not_found":
            errorMessage = "L'username non esiste";
            break;
        case "wrong_password":
            errorMessage = "Password errata. Ritenta";
            break;
        default:
            errorMessage = "Errore generico, riprovare";
    }

    createModule(isLogin);
    const module = document.getElementById("loginModule").firstElementChild;
    const errorP = document.createElement("p");
    errorP.innerText = errorMessage;
    errorP.classList.add("error-message");
    module.appendChild(errorP);

}