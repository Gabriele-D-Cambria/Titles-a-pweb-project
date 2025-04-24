"use strict";

export const patterns = {
    USERNAME : "^[a-zA-Z][a-zA-Z0-9_.]{2,9}$",
    //? source: https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    PASSWORD: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$"
    //? endsource
};

export const ERROR_MESSAGES = {
    username_taken: "Username già esistente.",
    invalid_username: "Username non valido. Deve iniziare con una lettera e avere tra 3 e 10 caratteri.",
    invalid_password: "Password non valida. Deve contenere almeno 8 caratteri e non più di 15, una lettera maiuscola, una minuscola, un numero e un carattere speciale.",
    password_mismatch: "Le password non corrispondevano.",
    registration_failed: "Registrazione fallita. Riprova.",
    connection_failed: "Il server non è al momento disponibile. \n Riprovare tra un po'.",
    username_not_found: "L'username non esiste",
    wrong_password: "Password errata. Ritenta",
    default: "Errore generico, riprovare"
};

/**
 * Crea un input per l'username con le relative proprietà e validazioni.
 * @param {String} id - L'id da assegnare all'input.ù
 * @param {String} labelTxt - Il testo del label associato.
 * @returns {Object} Un oggetto contenente il label e l'input creati.
 */
export function createUsernameInput(labelTxt){
    const label = document.createElement("label");
    const input = document.createElement("input");
    
    label.for = "username";
    label.innerText = labelTxt;
    input.type = "text";
    input.id = input.name = "username";
    input.toggleAttribute("required", true);

    input.pattern = patterns.USERNAME;
    input.title = "Deve iniziare con una lettera e avere tra 3 e 10 caratteri (lettere, punti o underscore).";
    input.placeholder = "User.0_";
    input.autocomplete = "off";
    input.addEventListener("input", validateForm);

    return {
        "label" : label,
        "input" : input
    };
}

/**
 * Crea un input per la password con un pulsante per mostrare/nascondere il contenuto.
 * @param {String} labelTxt - Il testo del label associato.
 * @param {Boolean} [isConfirm=false] - Indica se si tratta di un campo di conferma password.
 * @returns {Object} Un oggetto contenente il label e il contenitore della password.
 */
export function createPasswordInput(labelTxt, isConfirm = false) {
    const label = document.createElement("label");
    const passwordContainer = document.createElement("div");
    const input = document.createElement("input");
    const toggleBtn = document.createElement("button");

    label.for = (isConfirm)? "confirmPassword" : "password";
    label.innerText = labelTxt;

    passwordContainer.classList.add("password-container");

    input.type = "password";
    input.id = input.name = (isConfirm)? "confirmPassword" : "password";
    input.toggleAttribute("required", true);
    input.pattern = patterns.PASSWORD;

    input.title = (isConfirm)? "Deve essere uguale alla password." : "Deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale.";

    input.placeholder = isConfirm ? "Conferma" : "Password";
    input.addEventListener("input", validateForm);
    if(isConfirm)
        input.classList.toggle("invalid", true);

    passwordContainer.appendChild(input);

    toggleBtn.type = "button";
    toggleBtn.innerText = "Mostra";
    toggleBtn.classList.add("toggle-password");
    toggleBtn.addEventListener("click", (e) => {
        hideShow(e.target, isConfirm);
    });
    passwordContainer.appendChild(toggleBtn);

    return {
        "label": label,
        "passwordContainer": passwordContainer
    };
}

/**
 * Crea un pulsante con le proprietà specificate.
 * @param {String} type - Il tipo del pulsante (es. "button", "submit").
 * @param {String} id - L'id da assegnare al pulsante.
 * @param {String} text - Il testo da visualizzare sul pulsante.
 * @param {Function} [onClick] - La funzione da eseguire al click del pulsante.
 * @returns {HTMLButtonElement} Il pulsante creato.
 */
export function createButton(type, id, text, onClick) {
    const btn = document.createElement("button");
    btn.type = type;
    btn.id = id;
    btn.innerText = text;
    if (onClick) {
        btn.addEventListener("click", onClick);
    }
    return btn;
}

/**
 * Valida i campi del modulo (username, password, conferma password) e abilita/disabilita il pulsante di submit.
 */
export function validateForm(){
    let usr = document.getElementById("username");
    let psw = document.getElementById("password");
    let psw2 = document.getElementById("confirmPassword");
    let btn = document.getElementById("submit");
    let invalid = false;


    if(psw2 !== null && psw !== null){
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

    if(usr !== null && !usr.checkValidity()){
        invalid = true;
    }

    if(psw !== null && !psw.checkValidity()){
        invalid = true;
    }
    
    btn.toggleAttribute("disabled", invalid);
}

/**
 * Mostra o nasconde il contenuto di un campo password.
 * @param {HTMLElement} target - L'elemento che ha generato l'evento (es. pulsante toggle).
 * @param {Boolean} [confirm=false] - Indica se si tratta del campo di conferma password.
 */
export function hideShow(target, confirm = false){
    let input;
    input = document.getElementById((confirm)? "confirmPassword" : "password");

    if (input.type === "password") {
        input.type = "text";
        target.innerText = "Nascondi";
    } else {
        input.type = "password";
        target.innerText = "Mostra";
    }
}

/**
 * Mostra un modulo in sovraimpressione.
 * @param {String} id - L'id del modulo da visualizzare.
 * @param {Boolean} [showCoins=false] - Indica se portare in risalto le monete.
 */
export function showModule(id, showCoins = false){
    let module = document.getElementById(id);
    if(showCoins){
        const coins = document.querySelector(".coin-display");
        coins.style = "z-index: 2";
    }
    module.classList.add("show");
}

/**
 * Nasconde ed elimina il contenuto di un modulo in sovraimpressione.
 * @param {Event} event - L'evento che ha generato l'azione.
 * @param {String} id - L'id del modulo da rimuovere.
 * @param {Boolean} [override=false] - Indica se ignorare i controlli.
 * @param {Boolean} [showCoins=false] - Indica se rimuovere il focus sulle monete.
 * @returns {Boolean} True se la rimozione ha avuto effetto, altrimenti false.
 */
export function closeModule(event, id, override = false, showCoins = false) {
    const module = document.getElementById(id);
    if (override || event.target === module) {
        module.classList.remove("show");
        if(showCoins){
            const coins = document.querySelector(".coin-display");
            coins.style = "z-index: 0";
        }

        while(module.childElementCount)
            module.removeChild(module.firstChild);

        
        return true;
    }
    return false;
}

/**
 * Mostra un messaggio temporaneo sullo schermo che si rimuove automaticamente dopo 5 secondi.
 * @param {String} messaggio - Il testo del messaggio da visualizzare.
 */
export function showMessage(messaggio) {
    let messageContainer = document.createElement("div");
    messageContainer.id = "messageBox";
    messageContainer.classList.add("messaggio");
    messageContainer.innerText = messaggio;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.style.opacity = 0;
        messageContainer.style.transform = "translateY(-20px)";
    }, 1000);

    setTimeout(() => {
        document.body.removeChild(messageContainer);
    }, 4000);
}

/**
 * Crea un elemento HTML con le proprietà specificate.
 * @param {String} type - Il tipo dell'elemento (es. "div", "span").
 * @param {String} [className] - La classe CSS da assegnare all'elemento.
 * @param {String} [id] - L'id da assegnare all'elemento.
 * @param {String} [innerText] - Il testo da inserire nell'elemento.
 * @returns {HTMLElement} L'elemento creato.
 */
export function createElement(type, className, id, innerText){
    const el = document.createElement(type);
    if(className)
        el.classList.add(className);
    if(id)
        el.id = id;
    if(innerText)
        el.innerText = innerText;

    return el;
}