"use strict";

import {closeModule, showModule, createUsernameInput, createPasswordInput, createButton, showMessage, IMPORTANT_MESSAGE, errorHandler} from "./../utils/methods.js"

let moduleListener = null;

document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("loginBtn").addEventListener("click", () => {
       createModule(true);
    });
    document.getElementById("registerBtn").addEventListener("click", () => {
        createModule(false);
    });

    // Mostra un messaggio importante se presente
    if(message){
        showMessage(message, IMPORTANT_MESSAGE);
    }
    
    // Gestisce eventuali errori di login
    if(loginError){
        handleFormError(loginError);
    }
});

/**
 * Crea un modulo di login o registrazione.
 * @param {boolean} login - Indica se creare il modulo di login (true) o registrazione (false).
 */
function createModule(login){
    let module = document.getElementById("loginModule");

    let container = document.createElement("div");
    container.classList.add("module-container");
    let title = document.createElement("h2");
    title.innerText = (login)? "Login" : "Sign Up";
    container.appendChild(title);

    let form = document.createElement("form");

    form.method = "POST";
    form.action = "php/handlers/login.php";

    // Crea il campo per il nome utente
    let tag = createUsernameInput("Username:");
    form.appendChild(tag.label);
    form.appendChild(tag.input);

    // Crea il campo per la password
    tag = createPasswordInput("Password:", false);
    form.appendChild(tag.label);
    form.appendChild(tag.passwordContainer);

    // Crea il campo per confermare la password (solo per registrazione)
    if(!login){
        tag = createPasswordInput("Conferma Password:", true);
        form.appendChild(tag.label);
        form.appendChild(tag.passwordContainer);
    }
    container.appendChild(form);

    // Crea il pulsante di invio
    let btn = createButton("submit", "submit", login? "Accedi" : "Registrati");
    btn.toggleAttribute("disabled", true);
    form.appendChild(btn);

    // Crea il pulsante per chiudere il modulo
    btn = createButton("button", "closeModule", "Chiudi", (e) =>{
        if(moduleListener === null)
            return;
        if(closeModule(e, "loginModule", true)){
            window.removeEventListener("click", moduleListener);
            moduleListener = null;
        }
    });
    
    form.appendChild(btn);

    // Crea un link per passare tra login e registrazione
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
    
    // Mostra il modulo
    showModule(module.id);

    // Aggiunge un listener per chiudere il modulo cliccando fuori
    moduleListener = (e) => {
        if(closeModule(e, "loginModule"))
            moduleListener = null;
    };
    window.addEventListener("click", moduleListener);
}

/**
 * Gestisce gli errori del modulo di login o registrazione.
 * @param {Object} loginError - Oggetto che contiene informazioni sull'errore.
 */
function handleFormError(loginError){
    let module = document.getElementById("loginModule");
    if(!module.firstElementChild){
        createModule(loginError.isLogin);
    }

    errorHandler(loginError);
}