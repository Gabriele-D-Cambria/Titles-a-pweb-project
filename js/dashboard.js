"use strict";

import {showModule, closeModule, showMessage, createElement, patterns, changePassword, deleteAccount } from "./methods.js";

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
});

/**
 * Funzione per la gestione dei comandi da tastiera
 * @param {Event} e evento
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

function showMenu(){
    if(currentlyOpened !== null && currentlyOpened !== "menuModule"){
        return;
    }

    const module = document.getElementById("menuModule");
    currentlyOpened = module.id;

    const page = document.createElement("div");
    page.classList.add("menu-page");

    for(let i = 0; i < 3; ++i){
        const div = document.createElement("div");
        const p = document.createElement("p");
        switch(i){
            case 0:
                p.id = "changeUsr";
                p.innerText = "Cambia Username";
                p.addEventListener("click", changeUsername);
                break;
            case 1:
                p.id = "changePwd";
                p.innerText = "Cambia Password";
                p.addEventListener("click", changePassword);
                break;
            default:
                p.id = "deleteAccount";
                p.innerText = "Elimina Account";
                p.addEventListener("click", deleteAccount);
        }
        div.appendChild(p);
        page.appendChild(div);
    }
    module.appendChild(page);
    showModule(module.id, true);
    moduleListener = (e) => {
        closeModuleEvent(e, "menuModule")
    };
    window.addEventListener("click", moduleListener);
}

function addNewCharacter(){
    showMessage("Eh, volevi!!");
}

/**
 * Funzione che inserisce nel DOM la schermata dall'inventario
 * @param {Boolean} newItems indica se sono da evidenziare o meno degli item nella lista globale 'openedItems'
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
            if(risposta.ServerError !== undefined){
                throw risposta.ServerError;
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
                    changeModuleInfo(info);
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
            showMessage("Il server non è al momento raggiungibile, riprovare dopo");
            console.error('Errore: ', error);
        })

}

/**
 * Funzione di supporto per creare uno degli slot inventario di un oggetto
 * @param {Array} item oggetto da visualizzare
 * @param {Number} id indice da dare all'oggetto
 * @param {Boolean} newItems parametro che indica se controllare o meno che un oggetto sia stato appena recuperato
 * @returns
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

function showShop(){
    if(currentlyOpened !== null && currentlyOpened !== "shopModule")
        return;
    const module = document.getElementById("shopModule");
    currentlyOpened = module.id;

    if(shopTimerInterval !== null){
        clearInterval(shopTimerInterval);
        shopTimerInterval = null;
    }
    
    document.body.classList.add("caricamento");
    fetch('php/API/getShopItems.php')
        .then(response => response.json())
        .then(risposta => {
            document.body.classList.remove("caricamento");
            if(risposta.ServerError !== undefined){
                throw risposta.ServerError;
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
                    changeModuleInfo(info);
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
            showMessage("Il server non è al momento raggiungibile, riprovare dopo");
            console.error("Errore: ", error);
        })
}

/**
 * Funzione che genera un aside contenente le informazioni
 * @param {String} id id da dare all'aside
 * @param {Array} item oggetto del quale generare le informazioni. Di default è null, e indica l'assenza di un'oggetto da creare
 * @param {Boolean} hasIt indica se l'oggetto selezionato è già di proprietà dell'utente o è da acquistare. Default 'true'
 * @returns un 'aside' contenente le informazioni
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
            changeModuleInfo(info);
            shownItem = null;
        });
        el.appendChild(btn);

        container.appendChild(el);
    }

    return container;
}

/**
 * Funzione che toglie dal DOM il modulo sopraelevato
 * @param {Event} event evento generatore
 * @param {String} id id del modulo da rimuovere
 * @param {Boolean} overload indica se effettuare o meno il controllo sull'evento.
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
 * Funzione che aggiunge al modulo attualmente aperto le informazioni
 * @param {Element} info informazioni da appendere
 */
function changeModuleInfo(info){
    if(currentlyOpened === null)
        return
    let module = document.getElementById(currentlyOpened);
    module = module.firstChild;
    module.removeChild(module.lastChild);
    module.appendChild(info);
}

/**
 * Funzione che si occupa di fare una richiesta API per vendere un oggetto
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
        if(data.ServerError !== undefined){
            throw data.ServerError;
        }
        if(data.error){
            showMessage("Error: " + data.error);
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
        console.error("Errore durante la vendita", error);
        showMessage("C'è stato un errore nella vendita");
    });
}

/**
 * Funzione che prova ad acquistare un Item dal negozio verificando che si abbia un saldo sufficente
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
        if(data.ServerError !== undefined){
            throw data.ServerError;
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
        console.error("Errore durante la vendita", error);
        showMessage("C'è stato un errore nella vendita");
    });
}

/**
 * Funzione che aggiorna il contatore di monete
 */
function updateCoins(amount){
    let coins = document.getElementById("coin-count");
    coins.innerText = Number(coins.innerText) + amount;
}

/**
 * Funzione che si occupa di aprire una box effettuando una richiesta API per recuperare i nuovi oggetti
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
        if(data.ServerError !== undefined){
            throw data.ServerError;
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
        console.error("Errore durante l'apertura", error);
        showMessage("C'è stato un errore nell'apertura");
    });
}

/**
 * Aggiorno il timer del negozio se presente
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

function changeUsername(){
    
}