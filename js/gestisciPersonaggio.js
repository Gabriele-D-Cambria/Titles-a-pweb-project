"use strict";

import {showMessage, showModule, closeModule, createButton} from "./methods.js";

let moduleListener = null;
let currentlyOpened = null;

document.addEventListener("DOMContentLoaded", () =>{
	document.getElementById("deletePG").addEventListener("click", createDeleteBox);
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