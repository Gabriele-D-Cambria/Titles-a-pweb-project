"use strict";

import {showMessage, showModule, closeModule, createButton, errorHandler} from "./methods.js";

let moduleListener = null;
let currentlyOpened = null;
let usedPU = {
	PF: 0,
	FOR: 0,
	DES: 0
};

document.addEventListener("DOMContentLoaded", () =>{
	document.getElementById("backToDash").addEventListener("click", (e)=>{
		e.preventDefault();
		window.location.href = "./php/dashboard.php";
	});
	document.getElementById("deletePG").addEventListener("click", createDeleteBox);
	
	setUpgradePointsPrivileges();

	if(message){
		showMessage(message);
	}
	if(errorMessage){
		errorHandler(errorMessage);
	}
});

function createDeleteBox(){
	if(currentlyOpened !== null && currentlyOpened !== "deleteModule"){
		return;
	}

	const module = document.getElementById("deleteModule");
	currentlyOpened = module.id;

	const page = document.createElement("div");
	page.classList.add("delete-page");

	let space = document.createElement("div");
	space.classList.add("menu-space");
	space.classList.add("header");

	let el = document.createElement("h2");
	el.innerText = "Stai per Eliminare il personaggio";
	space.appendChild(el);

	el = document.createElement("p");
	el.innerText = "Sei sicuro?";

	space.appendChild(el);
	page.appendChild(space);

	space = document.createElement("div");
	space.classList.add("menu-space");

	const form = document.createElement("form");
	form.action = "php/handlePG.php";
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
	el.innerText = "Eliminando il personaggio ";
	const boldText = document.createElement("b");
	boldText.innerText = "lo perderai in maniera definitiva.";
	el.appendChild(boldText);
	el.appendChild(document.createTextNode(", sei sicuro di volerlo fare?\nGli oggetti nello zaino verranno inviati al tuo inventario."));
	form.appendChild(el);

	const aside = document.createElement("aside");
	aside.classList.add("button-holder");

	el = createButton("submit", "submit", "Elimina");
	aside.appendChild(el);

	el = createButton("button", "backToMenu", "Annulla", () => {
		closeModuleEvent(null, module.id, true);
	});
	
	aside.appendChild(el);
	form.appendChild(aside);

	space.appendChild(form);
	page.appendChild(space);

	while(module.childElementCount){
		module.removeChild(module.lastChild);
	}

	closeModule(null, module.id, true);
	module.appendChild(page);
	showModule(module.id);
	moduleListener = (e) => {
		closeModuleEvent(e, module.id);
	};
	window.addEventListener("click", moduleListener);
}

/**
 * Chiude un modulo sopraelevato (overlay) dal DOM.
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
		currentlyOpened = null;
		closeModule(null, id, true);
	}
}

function setUpgradePointsPrivileges(){
	// return;
	fetch("php/API/getCurrentPG.php")
		.then(response => response.json())
		.then(PG => {
			if(PG.error !== undefined && PG.error){
				throw PG;
			}
			console.log(PG); //! da rimuovere ----------------------------------------------------

			let btn = null;
			if(PG.puntiUpgrade > 0){
				btn = document.getElementById("more-PF");
				btn.classList.add("clickable");
				btn.addEventListener("click", (e) =>{
					aggiornaStat(e.target.id, true, PG);
				});

				document.getElementById("less-PF").addEventListener("click", (e) =>{
					aggiornaStat(e.target.id, false, PG);
				});
				

				if(PG.FOR < PG.MAX_FOR_DES){
					btn = document.getElementById("more-FOR")
					btn.classList.add("clickable");
					btn.addEventListener("click", (e) =>{
						aggiornaStat(e.target.id, true, PG);
					});
				}
				
				document.getElementById("less-FOR").addEventListener("click", (e) =>{
					aggiornaStat(e.target.id, false, PG);
				});
				
				if(PG.DES < PG.MAX_FOR_DES){
					btn = document.getElementById("more-DES");
					btn.classList.add("clickable");
					btn.addEventListener("click", (e) =>{
						aggiornaStat(e.target.id, true, PG);
					});
				}
				
				document.getElementById("less-DES").addEventListener("click", (e) =>{
					aggiornaStat(e.target.id, false, PG);
				});
				
			}
		})
		.catch(error => {
			errorHandler(error);
			return;
		})
}

/**
 * Aggiorna le statistiche del personaggio.
 * @param {string} id id della statistica da modificare
 * @param {boolean} aumenta se `true` aumenta il valore, altrimenti lo diminuisce
 * @param {Array} PG contiene informazioni sulle statistiche del personaggio
 */
function aggiornaStat(id, aumenta, PG){
	let statId = id.split("-")[1];
	let upd = (aumenta)? 1 : -1;
	let totalUsedPU = Object.values(usedPU).reduce((prev, curr) => {
		return prev + curr;
	}, 0);

	if(aumenta && PG.puntiUpgrade === totalUsedPU){
		return;
	}
	
	switch (statId) {
        case "PF":
			if(!aumenta && !usedPU.PF)
				return;
            PG.PF = Number(PG.PF) + upd;
            usedPU.PF += upd;
			document.getElementById(`less-${statId}`).classList.toggle("clickable", (usedPU.PF));
            break;
        case "FOR":
			if(!aumenta && !usedPU.FOR)
				return;
            if (PG.FOR < PG.MAX_FOR_DES && PG.FOR > PG.MIN_FOR_DES) {
                PG.FOR += upd;
                usedPU.FOR += upd;
				document.getElementById(`more-${statId}`).classList.toggle("clickable", (PG.FOR !== PG.MAX_FOR_DES));
				document.getElementById(`less-${statId}`).classList.toggle("clickable", (PG.FOR !== PG.MIN_FOR_DES && usedPU.FOR));
				document.getElementById("damage").innerText = PG.DAMAGE_LOOKUP[PG.FOR];
				document.getElementById("damage").classList.toggle("updated", (PG.damage !== PG.DAMAGE_LOOKUP[PG.FOR]));
				break;
            } 
            return;
        case "DES":
			if(!aumenta && !usedPU.DES)
				return;
            if (PG.DES < PG.MAX_FOR_DES && PG.DES > PG.MIN_FOR_DES) {
                PG.DES += upd;
                usedPU.DES += upd;
				document.getElementById(`more-${statId}`).classList.toggle("clickable", (PG.DES !== PG.MAX_FOR_DES));
				document.getElementById(`less-${statId}`).classList.toggle("clickable", (PG.DES !== PG.MIN_FOR_DES && usedPU.DES));
				document.getElementById("dodge").innerText = `${PG.DODGE_LOOKUP[PG.DES]}%`;
				document.getElementById("dodge").classList.toggle("updated", (PG.dodgingChance !== PG.DODGE_LOOKUP[PG.DES]));
				break;
            } 
			return;
        default:
            return;
    }

	totalUsedPU += upd;

	document.getElementById(statId).value = PG[statId];
	document.getElementById(statId).classList.toggle("updated", usedPU[statId]);
	
	document.getElementById("more-PF").classList.toggle("clickable", (PG.puntiUpgrade !== totalUsedPU));
	document.getElementById("more-FOR").classList.toggle("clickable", (PG.puntiUpgrade !== totalUsedPU));
	document.getElementById("more-DES").classList.toggle("clickable", (PG.puntiUpgrade !== totalUsedPU));

	document.getElementById("PU-points").innerText = PG.puntiUpgrade - totalUsedPU;

	document.getElementById("upgradeStats").toggleAttribute("disabled", (totalUsedPU === 0));
	
}