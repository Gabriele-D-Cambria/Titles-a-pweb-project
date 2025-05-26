"use strict";

import {closeModule, showModule, createUsernameInput, createPasswordInput, createButton, showMessage, IMPORTANT_MESSAGE, errorHandler, createHTMLElement} from './methods.js'

let moduleListener = null;
let sliderTimer = null;
const SLIDER_INTERVAL = 10000;

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

    createSlider();
});




/**
 * Crea un modulo di login o registrazione.
 * @param {boolean} login - Indica se creare il modulo di login (true) o registrazione (false).
 */
function createModule(login) {
    let module = document.getElementById("loginModule");

    let container = document.createElement("div");
    container.classList.add("module-container");
    let title = document.createElement("h2");
    title.innerText = (login)? "Login" : "Sign Up";
    container.appendChild(title);

    let form = document.createElement("form");

    form.method = "POST";
    form.action = "php/login.php";

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

function createSlider() {
    const sliderData = [
        {
            img: "images/png/Inventario.png",
            title: "Gestisci l'Inventario",
            text: "Gestisci il tuo inventario, equipaggia armi e armature, usa pozioni e vendi oggetti inutili.\n"
        },
        {
            img: "images/png/shop.png",
            title: "Utilizza il Negozio",
            text: "Acquista nuovi oggetti e potenziamenti per il tuo personaggio nel negozio.\nCompra le box, e spacchetale per ottenere equipaggiamenti e monete!\nChissà, magari potresti essere fortunato."
        },
        {
            img: "images/png/personaggi.png",
            title: "Crea i Personaggi",
            text: "Crea fino a 5 personaggi per giocare contro gli altri utenti.\nSeclgi per loro un elemento e dagli un nome.\nPotenziali, equipaggiali sfuttando gli effetti di prevalenza e gioca battaglie per ottenere fantastiche ricompense!"
        },
        {
            img: "images/png/Battaglia.png",
            title: "Gioca le Battaglie",
            text: "Con i tuoi personaggi gioca delle battaglie contro i personaggi degli altri account.\n Avrai 30 secondi nei quali puoi decidere se attaccare o utilizzare un oggetto tra quelli che ti eri equipaggiato.\nSfrutta a pieno il tuo personaggio facendogli infliggere ingenti danni e permettendogli di schivare i colpi avversari!"
        }
    ];

    let current = 0;

    function resetSliderTimer() {
        if (sliderTimer) {
            clearInterval(sliderTimer);
        }
        sliderTimer = setInterval(() => {
            current = (current + 1) % sliderData.length;
            updateSlider(sliderData[current]);
        }, SLIDER_INTERVAL);
    }

    
    updateSlider(sliderData[current]);

    document.getElementById('slider-prev').addEventListener('click', () => {
        current = (current - 1 + sliderData.length) % sliderData.length;
        updateSlider(sliderData[current]);
        resetSliderTimer();
    });
    
    document.getElementById('slider-next').addEventListener('click', () => {
        current = (current + 1) % sliderData.length;
        updateSlider(sliderData[current]);
        resetSliderTimer();
    });

    resetSliderTimer();
}

function updateSlider(data) {
    document.getElementById('slider-img').src = data.img;

    document.getElementById('info-title').innerText = data.title;
    
    const splittedText = String(data.text).split("\n");

    const textSpace = document.getElementById('info-text');
    while(textSpace.childElementCount)
        textSpace.removeChild(textSpace.firstChild);

    splittedText.forEach((txt) =>{
        textSpace.appendChild(createHTMLElement("p", null, null, txt));
    });
}