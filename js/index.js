"use strict";

import {closeModule, showModule, createUsernameInput, createPasswordInput, createButton, showMessage, IMPORTANT_MESSAGE, errorHandler} from './methods.js'

let moduleListener = null;
const LOGIN_PAGE = "php/login.php";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").addEventListener("click", () => {
       createModule(true);
    });
    document.getElementById("registerBtn").addEventListener("click", () => {
        createModule(false);
    });

    if(message){
        showMessage(message, IMPORTANT_MESSAGE);
    }
    
    if(loginError){
        handleFormError(loginError);
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
    let tag = createUsernameInput("Username:");
    form.appendChild(tag.label);
    form.appendChild(tag.input);

    // Password
    tag = createPasswordInput("Password:", false);
    form.appendChild(tag.label);
    form.appendChild(tag.passwordContainer);

    // Conferma Password
    if(!login){
        tag = createPasswordInput("Conferma Password:", true);
        form.appendChild(tag.label);
        form.appendChild(tag.passwordContainer);
    }
    container.appendChild(form);

    let btn = createButton("submit", "submit", login? "Accedi" : "Registrati");
    btn.toggleAttribute("disabled", true);
    form.appendChild(btn);


    btn = createButton("button", "closeModule", "Chiudi", (e) =>{
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

    
    moduleListener = (e) => {
        closeModule(e, "loginModule");
        moduleListener = null;
    };
    window.addEventListener("click", moduleListener);
}


function handleFormError(loginError){

    let module = document.getElementById("loginModule");
    if(!module.firstElementChild){
        createModule(loginError.isLogin);
    }

    errorHandler(loginError);

    // module = module.firstElementChild;
    // const errorP = document.createElement("p");
    // errorP.innerText = errorMessage;
    // errorP.classList.add("error-message");
    // module.appendChild(errorP);
}