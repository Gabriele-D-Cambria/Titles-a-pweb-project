"use strict";

import {showMessage, errorHandler, createHTML_img} from "./methods.js"
import { centerSvgElement, insertClippedImage } from "./svgMethods.js";
import { Timer } from "./definitions.js";


let gameTimer = null;

let turno = null;


document.addEventListener("DOMContentLoaded", () => {
	
	fetch('./../images/arena.svg')
        .then(response => response.text())
        .then(svg => {
			document.getElementById('imageContainer').innerHTML = svg;
			getGameInfo();
		});


	if(message)
		showMessage(message);

	if(errorMessage)
		errorHandler(errorMessage);
});


function getGameInfo(){
	fetch('./API/getGameInfo.php')
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if(data.error !== undefined && data.error)
				throw data;

			turno = data.turno;
			setArenaPG(data.pg1, data.pg2);

			// TODO
			/**
			 * attack event
			 * updateStatus
			 * arrenditi
			 */

			setTimer(data.tempoRimanente);

			setZaino(data.pg1.zaino);

			setTurn(data.tempoRimanente_secondi);
		})
		.catch(error => errorHandler(error));
}

function setArenaPG(PG1, PG2){
	
	const svgDoc = document.querySelector('svg');
	svgDoc.getElementById('tuoPG').setAttribute("href", "./../" + PG1.pathImmaginePG);
	svgDoc.getElementById('enemyPG').setAttribute("href", "./../" + PG2.pathImmaginePG);


	if(PG1.arma)
		insertClippedImage(svgDoc, "arma_pg1", PG1.arma['PathImmagine'], "clipArmaPG1");
	if(PG1.armatura)
		insertClippedImage(svgDoc, "armatura_pg1", PG1.armatura['PathImmagine'], "clipArmaturaPG1");

	if(PG2.arma)
		insertClippedImage(svgDoc, "arma_pg2", PG2.arma['PathImmagine'], "clipArmaPG2");
	if(PG2.armatura)
		insertClippedImage(svgDoc, "armatura_pg2", PG2.armatura['PathImmagine'], "clipArmaturaPG2");


	svgDoc.getElementById("nome_pg1").innerHTML = PG1.nome;
	svgDoc.getElementById("nome_pg2").innerHTML = PG2.nome;
	centerSvgElement(svgDoc, "nome_pg1", "PF-box_pg1", false);
	centerSvgElement(svgDoc, "nome_pg2", "PF-box_pg2", false);

	const totalWidth1 = svgDoc.getElementById("PF-box_pg1").getAttribute("width") - svgDoc.getElementById("PF-box_pg1").getAttribute("stroke-width");
	svgDoc.getElementById("tmpPF_pg1").setAttribute("width", (PG1.temp_PF/PG1.PF) * totalWidth1);
	svgDoc.getElementById("tmpPF_pg2").setAttribute("width", (PG2.temp_PF/PG2.PF) * totalWidth1);
	svgDoc.getElementById("pf_text_pg1").innerHTML = `${PG1.temp_PF}/${PG1.PF}`;
	svgDoc.getElementById("pf_text_pg2").innerHTML = `${PG2.temp_PF}/${PG2.PF}`;

}

function setTimer(tempoRimanente){
	document.getElementById("timer").innerText = tempoRimanente;
	if(gameTimer !== null){
		gameTimer.clearTimer();
		gameTimer = null;
	}

	gameTimer = new Timer(changeTurn, 1000);
}

function setZaino(zaino){
	if(zaino !== null){
		zaino.forEach((item, index) => {
			let space = document.getElementById(`obj_${index}`);

			let img = createHTML_img(item.PathImmagine, item.Descrizione, item.Nome, `obj_${index}-img`);

			while(space.childElementCount)
				space.removeChild(space.firstChild);
			space.appendChild(img);
			space.addEventListener("click",(e) => {
				if(turno){
					const id = String(e.target.id).split("-")[0];
					const btn = document.getElementById("actionBtn");
					if(document.getElementById(id).classList.toggle("selected-item")){
						btn.classList.add("oggetto");
						btn.classList.remove("attacco");
						btn.innerText = "Usa Oggetto";
						document.getElementById(`input-${id}`).checked = true;
					}
					else{
						btn.classList.add("attacco");
						btn.classList.remove("oggetto");
						btn.innerText = "Attacca";
						document.getElementById(`input-${id}`).checked = false;
					}
				}
			});
		});
	}
}

/**
 * Funzione che imposta l'interfaccia a seconda di chi è il turno
 * @param {Number} tempoMassimo indica il tempo massimo che può aspettare il nemico prima di effettuare la mossa se è il suo turno
 */
function setTurn(tempoMassimo){
	const btn = document.getElementById("actionBtn");
	btn.addEventListener("click", play);

	if(!turno){
		btn.setAttribute("disabled", true);
		btn.innerText = "Attendi il tuo turno";
		// Tra un tempo casuale gioca
		const randomDelay = Math.max(6000, Math.floor(Math.random() * 1000) % (tempoMassimo) * 1000);
		setTimeout(() => {
			changeTurn();
		}, randomDelay);
	}
	else{
		btn.removeAttribute("disabled");
		btn.innerText = "Attacca";
		btn.classList.add("attack");
	}
}

function play(){
	if(!turno){
		return;
	}

	const formData = new FormData();
	const selectedObj = document.querySelector('input[name="usingObj"]:checked');

	if(selectedObj) {
		formData.append("azione", "usa_oggetto");
		formData.append("oggetto_index", selectedObj.value);
	} 
	else {
		formData.append("azione", "attacco");
	}

	sendPlay(formData);
}


/**
 * Funzione che cambia il turno del personaggio eseguendo una mossa casuale
 */
function changeTurn(){
	if(gameTimer){
		gameTimer.clearTimer();
		gameTimer = null;
	}

	const formData = new FormData();
	formData.append("azione", "casuale");

	sendPlay(formData);

}

/**
 * Funzione che si occupa di inviare al server informazioni sull'azione effettuata. Successivamente ricarica lo stato.
 * @param {FormData} formData contennete le informazioni da comunicare all'API
 */
function sendPlay(formData){
	fetch("./API/playAction.php", {
		method: "POST",
		body: formData
	})
	.then(response => response.json())
	.then(result => {
		if(result.error !== undefined && result.error){
			throw result;
		}
		
		showMessage("ESDRONGO");
		getGameInfo();
	})
	.catch(error => errorHandler(error));
}