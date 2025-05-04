"use strict";

import {showMessage} from "./methods.js"

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("backToDash").addEventListener("click", ()=>{
		window.location.href = "./php/dashboard.php";
	});

	document.getElementById("prevPG").addEventListener("click", () =>{
		changePG(false);
	});
	document.getElementById("nextPG").addEventListener("click", () =>{
		changePG(true);
	});

	document.getElementById("PG-name").addEventListener("input", checkValidity);
});

function checkValidity(e){
	let invalid = false;

	if(!e.target.checkValidity()){
		invalid = true;
	}

	document.getElementById("createPG").toggleAttribute("disabled", invalid);

}

/**
 * Funzione che cambia il personaggio selezionato
 * @param {boolean} next indica se andare avanti o indietro con i PG
 */
function changePG(next){

}