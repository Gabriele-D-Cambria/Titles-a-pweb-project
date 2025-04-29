"use strict";

import {showModule, closeModule, showMessage, createElement, createUsernameInput, createButton, createPasswordInput, IMPORTANT_MESSAGE, errorHandler } from "./methods.js";

/**
 * Indica la funzione di listener per rimuovere i moduli in sovraimpressione
 */
let moduleListener = null;
/**
 * Indica quale item è stato selezionato dall'utente per venire mostrato nel dettaglio
 */
let shownItem = null;

/**
 * Indica se nel dettaglio è presente una box, necessaria per poterla aprire da tastiera
 */
let openBoxSelected = false;

/**
 * Contiene l'id del modulo aperto in un determinato momento
 */
let currentlyOpened = null;

/**
 * Contiene gli item restituiti dalla box aperta
 */
let openedItems = [];

/**
 * Timer del negozio
 */
let shopTimerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-character").addEventListener("click", addNewCharacter);
    document.getElementById("inventory-btn").addEventListener("click", () => {showInventory()});
    document.getElementById("shop-btn").addEventListener("click", () => {showShop()});
    document.getElementById("menu").addEventListener("click", () => {showMenu()});
    document.addEventListener("keypress", handleKeyPress);

    if(message){
        showMessage(message, IMPORTANT_MESSAGE);
    }
});

/**
 * Funzione per la gestione dei comandi da tastiera
 * @param {Event} e Evento generato dalla pressione di un tasto
 */
function handleKeyPress(e){
    const keyCode = e.code.toUpperCase();
    switch(keyCode){
        case "KEYI":
            (moduleListener === null)?
                showInventory() :
                closeModuleEvent(null, "inventoryModule", true);
            break;
        case "KEYN":
            (moduleListener === null)?
                showShop() :
                closeModuleEvent(null, "shopModule", true);
            break;
        case "SPACE":
            if(openBoxSelected) openBox();
            break;
    }
}

/**
 * Mostra il menu principale con le opzioni per cambiare username, cambiare password o eliminare l'account
 */
function showMenu(){
    if(currentlyOpened !== null && currentlyOpened !== "menuModule"){
        return;
    }

    const module = document.getElementById("menuModule");
    currentlyOpened = module.id;

    const page = document.createElement("div");
    page.classList.add("menu-page");

    const menuOptions = [
        { 
            id: "changeUsr",
            text: "Cambia Username",
            action: changeUsername
        },
        { 
            id: "changePwd",
            text: "Cambia Password",
            action: changePassword
        },
        { 
            id: "deleteAccount",
            text: "Elimina Account",
            action: deleteAccount
        }
    ];

    menuOptions.forEach((option) => {
        const div = document.createElement("div");
        div.classList.add("menu-space");
        
        const p = document.createElement("p");
        p.id = option.id;
        p.innerText = option.text;
        p.addEventListener("click", option.action);
        div.appendChild(p);
        page.appendChild(div);
    });

    closeModule(null, "menuModule", true);
    module.appendChild(page);
    showModule(module.id);
    moduleListener = (e) => {
        closeModuleEvent(e, "menuModule");
    };
    window.addEventListener("click", moduleListener);
}

function changeUsername(){
    if(currentlyOpened !== "menuModule"){
        return;
    }
    
    const module = document.getElementById("menuModule");

    const page = document.createElement("div");
    page.classList.add("username-page");

    let space = document.createElement("div");
    space.classList.add("menu-space");
    space.classList.add("header");

    let el = document.createElement("h2");
    el.innerText = "Username Attuale:";
    space.appendChild(el);

    el = document.createElement("p");
    el.innerText = USERNAME;

    space.appendChild(el);
    page.appendChild(space);

    space = document.createElement("div");
    space.classList.add("menu-space");

    const form = document.createElement("form");
    form.classList.add("username");
    form.action = "php/changeCredentials.php";
    form.method = "POST";

    el = createUsernameInput("Nuovo Username:");
    form.appendChild(el.label);
    form.appendChild(el.input);

    el = createButton("submit", "submit", "Conferma");
    el.toggleAttribute("disabled", true);
    form.appendChild(el);

    el = createButton("button", "backToMenu", "Annulla", showMenu);
    form.appendChild(el);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    module.appendChild(page);
}


function changePassword(){
    if(currentlyOpened !== "menuModule"){
        return;
    }
    
    const module = document.getElementById("menuModule");

    const page = document.createElement("div");
    page.classList.add("password-page");

    let space = document.createElement("div");
    space.classList.add("menu-space");
    space.classList.add("header");

    let el = document.createElement("h2");
    el.innerText = "Cambio Password";
    space.appendChild(el);

    page.appendChild(space);

    space = document.createElement("div");
    space.classList.add("menu-space");

    const form = document.createElement("form");
    form.classList.add("password");
    form.action = "php/changeCredentials.php";
    form.method = "POST";

    el = createPasswordInput("Nuova Password:", false);
    form.appendChild(el.label);
    form.appendChild(el.passwordContainer);

    el = createPasswordInput("Conferma Password:", true);
    form.appendChild(el.label);
    form.appendChild(el.passwordContainer);

    el = createButton("submit", "submit", "Conferma");
    el.toggleAttribute("disabled", true);
    form.appendChild(el);

    el = createButton("button", "backToMenu", "Annulla", showMenu);
    form.appendChild(el);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    module.appendChild(page);
}

function deleteAccount(){
    if(currentlyOpened !== "menuModule"){
        return;
    }
    
    const module = document.getElementById("menuModule");

    const page = document.createElement("div");
    page.classList.add("delete-page");

    let space = document.createElement("div");
    space.classList.add("menu-space");
    space.classList.add("header");

    let el = document.createElement("h2");
    el.innerText = "Stai per Eliminare l'account";
    space.appendChild(el);

    el = document.createElement("p");
    el.innerText = "Sei sicuro?";

    space.appendChild(el);
    page.appendChild(space);

    space = document.createElement("div");
    space.classList.add("menu-space");

    const form = document.createElement("form");
    form.action = "php/changeCredentials.php";
    form.method = "POST";

    // Lo sfrutto per capire se la richiesta è o meno di elimina account
    const phantomCheck = document.createElement("input");

    phantomCheck.type = "checkbox";
    phantomCheck.name = phantomCheck.id = "deleteCheck";
    phantomCheck.value = "1";
    phantomCheck.toggleAttribute("checked", true);
    phantomCheck.toggleAttribute("hidden", true);
    
    form.appendChild(phantomCheck);
    
    el = document.createElement("p");
    el.innerText = "Eliminando l'account ";
    const boldText = document.createElement("b");
    boldText.innerText = "perderai in maniera definitiva tutti i tuoi progressi";
    el.appendChild(boldText);
    el.appendChild(document.createTextNode(", sei sicuro di volerlo fare?"));
    form.appendChild(el);

    const aside = document.createElement("aside");
    aside.classList.add("button-holder");

    el = createPasswordInput("Conferma con Password:");
    aside.appendChild(el.label);
    aside.appendChild(el.passwordContainer);

    el = createButton("submit", "submit", "Elimina");
    el.toggleAttribute("disabled", true);
    aside.appendChild(el);

    el = createButton("button", "backToMenu", "Annulla", showMenu);
    aside.appendChild(el);
    form.appendChild(aside);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    module.appendChild(page);
}

/**
 * Mostra l'inventario dell'utente, recuperandolo tramite una richiesta API
 * @param {Boolean} newItems Indica se evidenziare gli oggetti appena ottenuti
 */
function showInventory(newItems = false){
    if(currentlyOpened !== null && currentlyOpened !== "inventoryModule")
        return;

    const module = document.getElementById("inventoryModule");
    currentlyOpened = module.id;
    
    document.body.classList.add("caricamento");
    fetch('php/API/getInventory.php')
        .then(response => response.json())
        .then(risposta =>{
            document.body.classList.remove("caricamento");
            if(risposta.error !== undefined && risposta.error){
                throw risposta.error;
            }
            const data = risposta["inventario"];
            const MAX_SIZE = risposta["MAX_SIZE"];

            const page = document.createElement("div");
            page.classList.add("inventory-page");

            const container = document.createElement("div");
            container.classList.add("inventory-container");

            let objCount = data.length;

            data.slice().forEach((item, index) => {
                const space = createItemSlot(item, index, newItems);
                space.addEventListener("click", (e) => {
                    const id = String(e.target.id).replace(/^(img-|ic-)/, "");
                    const info = generateInfo("inventory-info", data[id]);
                    changeItemInfo(info);
                });
                container.appendChild(space);
            });

            for(; objCount < MAX_SIZE; ++objCount){
                const space = document.createElement("div");
                space.classList.add("item-slot");

                container.appendChild(space);
            }

            page.appendChild(container);

            const info = generateInfo("inventory-info", shownItem);

            page.appendChild(info);

            closeModule(null, module.id, true, false);
            module.appendChild(page);
            const coins = document.querySelector(".coin-display");
            coins.style = "z-index: 2";
            showModule(module.id, true);
            moduleListener = (e) => {
                closeModuleEvent(e, "inventoryModule")

                };
            window.addEventListener("click", moduleListener);
        })
        .catch(error => {
            errorHandler(error);
        })

}

/**
 * Funzione di supporto per creare uno slot inventario per un oggetto
 * @param {Array} item Oggetto da visualizzare
 * @param {Number} id Indice da assegnare all'oggetto
 * @param {Boolean} newItems Indica se l'oggetto è stato appena recuperato
 * @returns {HTMLElement} Elemento HTML rappresentante lo slot dell'oggetto
 */
function createItemSlot(item, id, newItems) {
    const space = document.createElement("div");
    space.classList.add("item-slot");
    space.id = id;

    if (newItems && openedItems.includes(item.ID)) {
        space.classList.add("newItem");
    }

    const img = createElement("img");
    img.id = `img-${id}`;
    img.src = item.PathImmagine;
    img.alt = item.Descrizione;
    space.appendChild(img);

    const count = createElement("div");
    count.classList.add("item-count");
    count.id = `ic-${id}`;
    count.innerText = item.Quantita;
    space.appendChild(count);

    return space;
}

/**
 * Funzione di supporto per creare uno slot negozio per un oggetto
 * @param {Array} item Oggetto da visualizzare
 * @param {Number} id Indice da assegnare all'oggetto
 * @returns {HTMLElement} Elemento HTML rappresentante lo slot dell'oggetto nel negozio
 */
function createShopSlot(item, id){
    const space = document.createElement("div");
    space.classList.add("shop-slot");
    space.id = id;

    const img = document.createElement("img");
    img.id = `img-${id}`;
    img.src = item.PathImmagine;
    img.alt = item.Descrizione;
    space.appendChild(img);

    const caption = document.createElement("div");
    caption.id = `cap-${id}`;
    caption.innerText = `${item.Costo}🪙`;
    space.appendChild(caption);

    return space;
}

/**
 * Mostra il negozio dell'utente, recuperandolo tramite una richiesta API
 */
function showShop(){
    if(currentlyOpened !== null && currentlyOpened !== "shopModule")
        return;
    const module = document.getElementById("shopModule");
    currentlyOpened = module.id;

    shownItem = null;
    if(shopTimerInterval !== null){
        clearInterval(shopTimerInterval);
        shopTimerInterval = null;
    }
    
    document.body.classList.add("caricamento");
    fetch('php/API/getShopItems.php')
        .then(response => response.json())
        .then(risposta => {
            document.body.classList.remove("caricamento");
            if(risposta.error !== undefined && risposta.error){
                throw risposta.error;
            }
            const data = risposta.items;
            const remainingTime = risposta.remainingTime;

            const page = document.createElement("div");
            page.classList.add("shop-page");

            const container = document.createElement("div");
            container.classList.add("shop-container");

            let el = document.createElement("header");
            el.classList.add("timer-container");

            const p = document.createElement("p");
            p.classList.add("timer");
            p.innerText = `Prossimo Refresh \u2003 - \u2003`

            const span = document.createElement("span");
            span.id = "timer";

            span.innerText =  `${remainingTime.minutes}:${remainingTime.seconds}`;

            shopTimerInterval = setInterval(updateShopTimer, 1000);

            p.appendChild(span);
            el.appendChild(p);

            container.appendChild(el);

            el = document.createElement("div");
            el.classList.add("shop-slots");

            data.slice().forEach((item, index) => {
                const space = createShopSlot(item, index);

                space.addEventListener("click", (e) => {
                    const id = String(e.target.id).replace(/^(img-|cap-)/, "");
                    const info = generateInfo("shop-info", data[id], false);
                    changeItemInfo(info);
                });

                el.appendChild(space);
            });

            container.appendChild(el);
            page.appendChild(container);

            const info = generateInfo("shop-info", shownItem, false);

            page.appendChild(info);

            closeModule(null, module.id, true, false);
            module.appendChild(page);
            showModule(module.id, true);
            moduleListener = (e) => {
                closeModuleEvent(e, "shopModule");
            };

            window.addEventListener("click", moduleListener);
        })
        .catch(error => {
            errorHandler(error);
        })
}

/**
 * Genera un elemento HTML aside contenente le informazioni di un oggetto
 * @param {String} id ID da assegnare all'aside
 * @param {Array} item Oggetto per il quale generare le informazioni (null se assente)
 * @param {Boolean} hasIt Indica se l'oggetto è già di proprietà dell'utente
 * @returns {HTMLElement} Elemento HTML aside contenente le informazioni
 */
function generateInfo(id, item = null, hasIt = true){
    shownItem = item;
    openBoxSelected = false;
    const container = document.createElement("aside");
    container.id = id;

    if(item === null){
        const div = document.createElement("div");
        div.innerText = "Clicca su uno degli oggetti per ulteriori informazioni"

        container.appendChild(document.createElement("div"));
        container.appendChild(document.createElement("div"));
        container.appendChild(div);
    }
    else{
        let el = document.createElement("header");
        let p = document.createElement("p");

        p.innerText = item.Nome;
        el.appendChild(p);

        p = document.createElement("p");
        p.innerText = item.Tipologia;
        el.appendChild(p);

        container.appendChild(el);

        el = document.createElement("figure");

        const img = document.createElement("img");
        img.src = item.PathImmagine;
        img.alt = item.Descrizione;

        el.appendChild(img);

        p = document.createElement("figcaption");
        p.innerText = item.Elemento;
        el.appendChild(p);
        container.appendChild(el);

        p = document.createElement("p");
        p.classList.add("description");
        p.innerText = item.Descrizione;

        container.appendChild(p);

        el = document.createElement("div");

        if(hasIt && item.Tipologia === "box"){
            const open = document.createElement("button");
            open.id = "open";
            open.innerText = "Apri";

            open.addEventListener("click", openBox);
            openBoxSelected = true;

            el.appendChild(open);
        }
        else if(item.Tipologia !== "box"){
            const table = document.createElement("table");
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            let modificatore;
            let txt;

            switch(item.Tipologia){
                case "arma":
                    modificatore = "Danno";
                    txt = "Bonus Danno";
                    break;
                case "armatura":
                    modificatore = "Armatura";
                    txt = "Bonus Armatura ";
                    break;
                default:
                    modificatore = "RecuperoVita";
                    txt = "Bonus PF";
            }
            td.innerText = txt;
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerText = item[modificatore];
            tr.appendChild(td);
            table.appendChild(tr);

            tr = document.createElement("tr");
            td = document.createElement("td");
            td.innerText = "Modificatore FOR";
            tr.appendChild(td);
            td = document.createElement("td");

            td.innerText = item.ModificatoreFor;
            tr.appendChild(td);
            table.appendChild(tr);

            tr = document.createElement("tr");
            td = document.createElement("td");
            td.innerText = "Modificatore DEX";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerText = item.ModificatoreDex;
            tr.appendChild(td);

            table.appendChild(tr);
            el.appendChild(table);
        }
        else{
            const div = document.createElement("div");
            el.appendChild(div);
        }

        container.appendChild(el);

        el = document.createElement("footer");

        let btn = document.createElement("button");
        if(hasIt){
            btn.id = "sell-btn";
            btn.innerText = "Vendi: " + Math.floor(item.Costo / 2) + "🪙";
            btn.addEventListener("click", sellItem);
        }
        else{
            btn.id = "buy-btn";
            btn.innerText = "Compra: " + item.Costo + "🪙";
            btn.addEventListener("click", buyItem);
        }

        el.appendChild(btn);
        btn = document.createElement("button");
        btn.innerText = "Chiudi";
        btn.addEventListener("click", () => {
            let info = generateInfo(id);
            changeItemInfo(info);
            shownItem = null;
        });
        el.appendChild(btn);

        container.appendChild(el);
    }

    return container;
}

/**
 * Chiude un modulo sopraelevato (overlay) dal DOM
 * @param {Event} event Evento generatore
 * @param {String} id ID del modulo da rimuovere
 * @param {Boolean} overload Indica se effettuare il controllo sull'evento
 */
function closeModuleEvent(event, id, overload = false){
    if(moduleListener === null || currentlyOpened !== id)
        return;

    const module = document.getElementById(id);
    if(overload || event.target === module){
        window.removeEventListener("click", moduleListener);
        moduleListener = null;
        openBoxSelected = false;
        shownItem = null;
        currentlyOpened = null;
        if(shopTimerInterval !== null){
            clearInterval(shopTimerInterval);
            shopTimerInterval = null;
        }
        closeModule(null, id, true, true);
    }
}

/**
 * Aggiorna la sezione dettagli del modulo attualmente aperto con i dettagli di un oggetto selezionato
 * @param {HTMLElement} info Elemento HTML contenente le nuove informazioni dell'oggetto
 */
function changeItemInfo(info){
    if(currentlyOpened === null)
        return
    let module = document.getElementById(currentlyOpened);
    module = module.firstChild;
    module.removeChild(module.lastChild);
    module.appendChild(info);
}

/**
 * Effettua una richiesta API per vendere un oggetto selezionato
 */
function sellItem(){
    if(currentlyOpened !== "inventoryModule"){
        showMessage("Impossibile vendere un oggetto da questa interfaccia");
        return;
    }
    if(!shownItem){
        showMessage("Nessun Oggetto da Vendere");
        return;
    }
    document.body.classList.add("caricamento");
    fetch('php/API/sellItem.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            "itemId": shownItem.ID
        })
    })
    .then(response => response.json())
    .then(data => {
        document.body.classList.remove("caricamento");
        if(data.error !== undefined && data.error){
            throw data.error;
        }
        else{
            updateCoins(data.guadagno);
            if(data.rimosso){
                shownItem = null;
            }
            showInventory();
            showMessage(`Vendita effettuata | +${data.guadagno}🪙`);
        }
    })
    .catch(error => {
        errorHandler(error);
    });
}

/**
 * Effettua una richiesta API per acquistare un oggetto selezionato dal negozio
 */
function buyItem(){
    if(currentlyOpened !== "shopModule"){
        showMessage("Impossibile acquistare un oggetto da questa interfaccia");
        return;
    }
    if(!shownItem){
        showMessage("Nessun Oggetto da Acquistare");
        return;
    }
    document.body.classList.add("caricamento");
    fetch('php/API/buyItem.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'itemId': shownItem.ID
        })
    })
    .then(response => response.json())
    .then(data => {
        document.body.classList.remove("caricamento");
        if(data.error !== undefined && data.error){
            throw data.error;
        }
        if(data.errore){
            showMessage("Errore: " + data.errore);
        }
        else{
            updateCoins(data.spesa);
            showMessage(`Acquisto effettuato | ${data.spesa}🪙`);
        }
    })
    .catch(error => {
        errorHandler(error);
    });
}

/**
 * Aggiorna il contatore delle monete dell'utente
 * @param {Number} amount Quantità di monete da aggiungere o sottrarre
 */
function updateCoins(amount){
    let coins = document.getElementById("coin-count");
    coins.innerText = Number(coins.innerText) + amount;
}

/**
 * Effettua una richiesta API per aprire una box e recuperare i nuovi oggetti
 */
function openBox(){
    if(currentlyOpened !== "inventoryModule")
        return;

    if(shownItem.Tipologia !== "box"){
        showMessage("Oggetto Non apribile");
        return;
    }

    document.body.classList.add("caricamento");
    fetch("php/API/openBox.php", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body : new URLSearchParams({
            'boxID' : shownItem.ID,
            'boxNome': shownItem.Nome
        })
    })
    .then(response => response.json())
    .then(data =>{
        document.body.classList.remove("caricamento");
        if(data.error !== undefined && data.error){
            throw data.error;
        }
        if(data.error){
            showMessage("Error: " + data.error);
        }
        else if(data.full){
            showMessage("Non hai abbastanza slot!");
        }
        else{
            updateCoins(data.guadagno);
            openedItems = data.itemsID;
            if(data.rimosso){
                shownItem = null;
            }
            showInventory(true);
            showMessage(`Box Aperta! | +${data.guadagno}🪙`);
        }
    })
    .catch(error => {
        errorHandler(error);
    });
}

/**
 * Aggiorna il timer del negozio, mostrando il tempo rimanente al prossimo refresh
 */
function updateShopTimer(){
    const span = document.getElementById("timer");
    if(span === null){
        clearInterval(shopTimerInterval);
        shopTimerInterval = null;
        return;
    }
    let [minutes, seconds] = span.innerText.split(":").map(Number);
    if(minutes === 0 && seconds === 0){
        clearInterval(shopTimerInterval);
        showShop();
        return;
    }
    else {
        if(seconds === 0){
            --minutes;
            seconds = 59;
        }
        else{
            --seconds;
        }
        span.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
}

/**
 * Mostra un messaggio di placeholder per l'aggiunta di un nuovo personaggio
 */
function addNewCharacter(){
    showMessage("Eh, volevi!!");
}