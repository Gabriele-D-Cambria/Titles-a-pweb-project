"use strict";

import {showModule, closeModule, openBox, showMessage } from "./methods.js";

let moduleListener = null;

let shownItem = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-character").addEventListener("click", addNewCharacter);
    document.getElementById("inventory-btn").addEventListener("click", showInventory);
    document.addEventListener("keypress", (e) =>{
        if(e.code.toUpperCase() == 'KEYI')
            (moduleListener === null)?  showInventory() : closeModuleEvent(null, "inventoryModule", true);
    })
});

function addNewCharacter(){
    showMessage("Eh, volevi!!");
}

function showInventory(){
    let module = document.getElementById("inventoryModule");

    fetch('php/API/getInventory.php')
        .then(response => response.json())
        .then(data =>{
            let page = document.createElement("div");
            page.classList.add("inventory-page");

            let container = document.createElement("main");
            container.classList.add("inventory-container");

            let objCount = 0;

            for(let i = 0; i < 40; ++i){

                let space = document.createElement("div");
                space.classList.add("item-slot");

                if(objCount < data.length){
                    let im = document.createElement("img");
                    im.id = "img-" + objCount;

//! ----------------------------------------------------
                    im.src = "images/coin.svg";
                    im.alt = "Immagine dell'oggetto";
//! ----------------------------------------------------

                    space.appendChild(im);

                    im = document.createElement("div");
                    im.classList.add("item-count");
                    im.id = "ic-" + objCount;

                    im.innerText = data[objCount].Quantita;

                    space.appendChild(im);
                    space.id = objCount;
                    space.addEventListener("click", (e) => {
                        let id = String(e.target.id);

                        id = id.replace(/^(img-|it-)/, "");

                        let info = generateInfo(data[id]);
                        changeInfo(info);
                    });

                    objCount++;
                }

                container.appendChild(space);
            }
            page.appendChild(container);

            let info = generateInfo(shownItem);

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
 * Funzione che genera un aside contenente le informazioni
 * @param {*} item item da descrivere. Di default null
 * @param {} guadagno
 * @returns aside element with the infos
 */
function generateInfo(item = null){
    shownItem = item;
    let container = document.createElement("aside");
    container.id = "inventory-info";

    if(item === null){
        let div = document.createElement("div");
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

        let img = document.createElement("img");

//!------------
        img.src = "images/coin.svg";
        img.alt = "Immagine dell'Oggetto";
//!------------
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
            let open = document.createElement("button");
            open.id = "open";
            open.innerText = "Apri";

            open.addEventListener("click", openBox);

            el.appendChild(open);
        }
        else{
            let table = document.createElement("table");
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


function closeModuleEvent(event, id, overload = false){
    if(moduleListener === null)
        return;

    const module = document.getElementById(id);
    if(overload || event.target === module){
        window.removeEventListener("click", moduleListener);
        moduleListener = null;
        shownItem = null;
        closeModule(null, id, true);
    }

}

function changeInfo(info){
    let module = document.getElementById("inventoryModule");
    module = module.firstChild;

    module.removeChild(module.lastChild);
    module.appendChild(info);
}

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

function updateCoins(amount){
    let coins = document.getElementById("coin-count");
    coins.innerText = Number(coins.innerText) + amount;
}
