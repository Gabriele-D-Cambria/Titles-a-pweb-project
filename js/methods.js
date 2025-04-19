"use strict";

/**
 * Funzione che permette di mostrare un modulo in sovraimpressione
 * @param {String} id id del modulo da visualizzare
 * @param {Boolean} showCoins indica se portare in risalto le monete o meno. Di default è 'true'
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
 * Funzione che permette di nascondere ed eliminare il contenuto di un modulo in sovraimpressione
 * @param {Event} event evento generatore
 * @param {String} id id del modulo da rimuovere
 * @param {Boolean} override indica se effettuare i controlli o meno
 * @param {Boolean} showCoins indica se rimuovere o meno il .coin-display
 * @returns {Boolean} se la rimozione ha avuto effetto o meno
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
 * Funione che si occupa di appendere al body un messaggio che si rimuove dopo 5 secondi
 * @param {String} messaggio testo del messaggio
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
 * Funzione che crea un elemento
 * @param {String} type tipo dell'Elemento
 * @param {String} className classe da dare, può essere null
 * @param {String} id id da dare, può essere null
 * @param {*} innerText testo da inserire, può essere null
 * @returns {Element} elemento
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