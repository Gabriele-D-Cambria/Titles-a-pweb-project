"use strict";

import {showModule, closeModule, showMessage, createElement } from "./methods.js";

let moduleListener = null;
let shownItem = null;
let openBoxSelected = false;
let openedItems = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-character").addEventListener("click", addNewCharacter);
    document.getElementById("inventory-btn").addEventListener("click", () => {showInventory()});
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
            (moduleListener === null)?  showInventory() : closeModuleEvent(null, "inventoryModule", true);
            break;
        case "SPACE":
            if(openBoxSelected) openBox();
            break;
    }
}

function addNewCharacter(){
    showMessage("Eh, volevi!!");
}

/**
 * Funzione che inserisce nel DOM la schermata dall'inventario
 * @param {Boolean} newItems indica se sono da evidenziare o meno degli item nella lista globale 'openedItems'
 */
function showInventory(newItems = false){
    const module = document.getElementById("inventoryModule");

    fetch('php/API/getInventory.php')
        .then(response => response.json())
        .then(risposta =>{
            const data = risposta["inventario"];
            const MAX_SIZE = risposta["MAX_SIZE"];

            const page = document.createElement("div");
            page.classList.add("inventory-page");

            const container = document.createElement("main");
            container.classList.add("inventory-container");

            let objCount = data.length;

            data.slice().forEach((item, index) => {
                const space = createItemSlot(item, index, newItems);
                space.addEventListener("click", (e) => {
                    const id = String(e.target.id).replace(/^(img-|it-)/, "");
                    const info = generateInfo(data[id]);
                    changeInfo(info);
                });
                container.appendChild(space);
            });

            for(; objCount < MAX_SIZE; ++objCount){
                const space = document.createElement("div");
                space.classList.add("item-slot");
                
                container.appendChild(space);
            }

            page.appendChild(container);

            const info = generateInfo(shownItem);

            page.appendChild(info);

            closeModule(null, module.id, true);
            module.appendChild(page);
            showModule(module.id);
            moduleListener = (e) => {
                closeModuleEvent(e, "inventoryModule")

                };
            window.addEventListener("click", moduleListener);
        })
        .catch(error => {
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

/**
 * Funzione che genera un aside contenente le informazioni
 * @param {Array} item oggetto del quale generare le informazioni. Di default è null, e indica l'assenza di un'oggetto da creare
 * @returns un 'aside' contenente le informazioni
 */
function generateInfo(item = null){
    shownItem = item;
    openBoxSelected = false;
    const container = document.createElement("aside");
    container.id = "inventory-info";

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

        el = document.createElement("main");

        if(item.Tipologia === "box"){
            const open = document.createElement("button");
            open.id = "open";
            open.innerText = "Apri";

            open.addEventListener("click", openBox);
            openBoxSelected = true;

            el.appendChild(open);
        }
        else{
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

        container.appendChild(el);

        el = document.createElement("footer");

        let btn = document.createElement("button");
        btn.id = "sell-btn";
        btn.innerText = "Vendi: " + Math.floor(item.Costo / 2) + "🪙";
        btn.addEventListener("click", sellItem);
        el.appendChild(btn);

        btn = document.createElement("button");
        btn.innerText = "Chiudi";
        btn.addEventListener("click", () => {
            let info = generateInfo();
            changeInfo(info);
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
    if(moduleListener === null)
        return;

    const module = document.getElementById(id);
    if(overload || event.target === module){
        window.removeEventListener("click", moduleListener);
        moduleListener = null;
        openBoxSelected = false;
        shownItem = null;
        closeModule(null, id, true);
    }

}

/**
 * Funzione che aggiunge al modulo inventario le informazioni
 * @param {Element} info informazioni da appendere
 */
function changeInfo(info){
    let module = document.getElementById("inventoryModule");
    module = module.firstChild;
    module.removeChild(module.lastChild);
    module.appendChild(info);
}

/**
 * Funzione che si occupa di fare una richiesta API per vendere un oggetto
 */
function sellItem(){
    if(!shownItem){
        showMessage("Nessun Oggetto da Vendere");
        return;
    }

    fetch('php/API/sellItem.php', {
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
        showMessage("C'è estato un errore nella vendita");
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
    if(shownItem.Tipologia !== "box"){
        showMessage("Oggetto Non apribile");
        return;
    }

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
        showMessage("C'è estato un errore nell'apertura");
    });
}