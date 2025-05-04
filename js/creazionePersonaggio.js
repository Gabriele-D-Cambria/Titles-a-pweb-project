"use strict";

import {showMessage, errorHandler} from "./methods.js";

let listaPersonaggi = null;
let idCurrentPG = null;
let costantiPersonaggi = null;

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("backToDash").addEventListener("click", ()=>{
		window.location.href = "./php/dashboard.php";
	});

	document.getElementById("prevPG").addEventListener("click", () =>{
		if(idCurrentPG !== null && listaPersonaggi !== null){
			--idCurrentPG;
			if(idCurrentPG < 0)
				idCurrentPG = listaPersonaggi.length - 1;
			setPG(listaPersonaggi[idCurrentPG]);
		}
	});
	document.getElementById("nextPG").addEventListener("click", () =>{
		if(idCurrentPG !== null && listaPersonaggi !== null){
			++idCurrentPG;
			if(idCurrentPG >= listaPersonaggi.length)
				idCurrentPG = 0
			setPG(listaPersonaggi[idCurrentPG]);
		}
	});

	document.getElementById("PG-name").addEventListener("input", checkValidity);

	getPersonaggi();
});

function checkValidity(e){
	let invalid = false;

	if(!e.target.checkValidity()){
		invalid = true;
	}

	document.getElementById("createPG").toggleAttribute("disabled", invalid);

}

function getPersonaggi(){
	fetch("php/API/getElementPG.php")
		.then(response => response.json())
		.then(data =>{
			if(data.error !== undefined && data.error){
				throw data.error;
			}

			listaPersonaggi = data['personaggi'];
			costantiPersonaggi = data['costanti'];

			idCurrentPG = 0;
			setPG(listaPersonaggi[idCurrentPG]);
		})
		.catch(error =>{
			errorHandler(error);
			return;
		});
}

/**
 * Funzione che imposta il personaggio e le sue statistiche, con relativi modificatori
 * @param {Object} personaggio personaggio da inserire
 */
function setPG(personaggio) {	
	document.getElementById("PF").innerText = Math.max(costantiPersonaggi.DEFAULT_PF + personaggio.ModificatorePF, costantiPersonaggi.MIN_HEALTH);

	let forza = costantiPersonaggi.DEFAULT_FOR_DES + personaggio.ModificatoreFor;

	if(forza < costantiPersonaggi.MIN_FOR_DES)
		forza = costantiPersonaggi.MIN_FOR_DES;
	else if(forza > costantiPersonaggi.MAX_FOR_DES)
		forza = costantiPersonaggi.MAX_FOR_DES;

	document.getElementById("FOR").innerText = forza;

	let destrezza = costantiPersonaggi.DEFAULT_FOR_DES + personaggio.ModificatoreDes;

	if(destrezza < costantiPersonaggi.MIN_FOR_DES)
		destrezza = costantiPersonaggi.MIN_FOR_DES;
	else if(destrezza > costantiPersonaggi.MAX_FOR_DES)
		destrezza = costantiPersonaggi.MAX_FOR_DES;

	document.getElementById("DES").innerText = destrezza;

	let img = document.getElementById("imagePG");

	img.src = personaggio.PathImmaginePG;
	img.alt = `Personaggio ${personaggio.Nome}`;

	document.getElementById("element").value = personaggio.Nome;

	document.getElementById("elementPic").src = personaggio.PathImmagine;

	document.getElementById("damage").innerText = costantiPersonaggi.DAMAGE_LOOKUP[forza];

	document.getElementById("dodge").innerText = `${costantiPersonaggi.DODGE_LOOKUP[destrezza]}%`;

	img = document.getElementById("prevalePic");
	let prevaleIndex = listaPersonaggi.findIndex(element => element.Nome === personaggio.PrevaleSu);
	img.src = listaPersonaggi[prevaleIndex].PathImmagine;
	img.alt = `Prevale su ${personaggio.PrevaleSu}`;
	
	img = document.getElementById("prevalsoPic");
	prevaleIndex = listaPersonaggi.findIndex(element => element.Nome === personaggio.PrevalsoDa);
	img.src = listaPersonaggi[prevaleIndex].PathImmagine;
	img.alt = `Prevalso da ${personaggio.PrevalsoDa}`;
}