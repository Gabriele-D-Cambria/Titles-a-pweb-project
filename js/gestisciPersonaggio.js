"use strict";

import {showMessage, errorHandler, showInventory, createDeleteBox} from "./methods.js";

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
	
	configurePage();

	if(message){
		showMessage(message);
	}
	if(errorMessage){
		errorHandler(errorMessage);
	}
});

document.addEventListener("click", () => {
	const menu = document.getElementById("remove-item-menu");
	menu.classList.remove("show");
	while(menu.childElementCount)
		menu.removeChild(menu.firstChild);
})


function configurePage(){
	fetch("php/API/getCurrentPGinfos.php")
		.then(response => response.json())
		.then(PG => {
			if(PG.error !== undefined && PG.error){
				throw PG;
			}

			if(PG.puntiUpgrade > 0)
				setUpgradePointsPrivileges(PG);
			
			setEquimpent(PG.arma, PG.armatura, PG.zaino);

		})
		.catch(error => {
			errorHandler(error);
			return;
		})
}

function setUpgradePointsPrivileges(PG){
	let btn = document.getElementById("more-PF");
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

/**
 * Aggiorna le statistiche del personaggio.
 * @param {string} id id della statistica da modificare
 * @param {boolean} aumenta se `true` aumenta il valore, altrimenti lo diminuisce
 * @param {Array} PG contiene informazioni sulle statistiche del personaggio
 */
export function aggiornaStat(id, aumenta, PG){
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

function setEquimpent(arma = null, armatura = null, zaino = null){
	let space = null;
	let img = null;
	if(arma !== null){
		space = document.getElementById("arma");
		
		img = document.createElement("img");
		img.id = "arma-img";
		img.src = arma.PathImmagine;
		img.alt = arma.Descrizione;
		img.title = arma.Nome;
		img.addEventListener("contextmenu", (e) => {
			addRemoveMenu(e.target.id, arma.ID);
		});
		
		while(space.childElementCount)
			space.removeChild(space.firstChild);
		space.appendChild(img);
	}
	if(armatura !== null){
		space = document.getElementById("armatura");
	
		img = document.createElement("img");
		img.id = "armatura-img";
		img.src = armatura.PathImmagine;
		img.alt = armatura.Descrizione;
		img.title = armatura.Nome;
		img.addEventListener("contextmenu",(e) => {
			addRemoveMenu(e, armatura.ID);
		});
		
		while(space.childElementCount)
			space.removeChild(space.firstChild);
		space.appendChild(img);
	}
	if(zaino !== null){
		zaino.forEach((item, index) => {
			space = document.getElementById(`obj_${index}`);
			
			img = document.createElement("img");
			img.id = `obj_${index}-img`;
			img.src = item.PathImmagine;
			img.alt = item.Descrizione;
			img.title = item.Nome;
			img.addEventListener("contextmenu",(e) => {
			addRemoveMenu(e, item.ID);
		});

			while(space.childElementCount)
				space.removeChild(space.firstChild);
			space.appendChild(img);
		});
	}

	space = document.querySelectorAll(".item-slot.bag-item");
	space.forEach(item => {
		item.addEventListener("click", (e) => {
			const id = String(e).split("-")[0];
			showInventory(false, true, id);
		})
	})
}

function addRemoveMenu(e, itemId){
	e.preventDefault();

	const menu = document.getElementById("remove-item-menu");

	menu.style.left = `${e.pageX}px`;
	menu.style.top = `${e.pageY}px`;
	menu.style.display = "block";
	

	const img = document.createElement("img");
	img.src = "images/trash.svg";
	img.alt = "Rimuovi l'Item";
	img.title = "Clicca l'immagine per rimuovere l'oggetto da questo personaggio";
	img.addEventListener("click", () =>{
		const formData = new FormData();
		
		formData.append("itemId_remove", JSON.stringify(itemId));

		fetch("php/API/togglePGItem.php", {
			method: "POST",
			body: formData,
		})
			.then(response => response.json())
			.then(data =>{
				if(data.error !== undefined && data.error){
				throw data;
				}

				window.location.reload();
			})
			.catch(error => {
				errorHandler(error);
			});
	})

	while(menu.childElementCount)
		menu.removeChild(menu.firstChild);
	menu.appendChild(img);

	menu.classList.add("show");
}