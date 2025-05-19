"use strict";

import {showMessage, errorHandler, createHTML_img} from "./methods.js"
import { centerSvgElement, insertClippedImage } from "./svgMethods.js";

document.addEventListener("DOMContentLoaded", () => {
	fetch('php/API/getGameInfo.php')
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if(data.error !== undefined && data.error)
				throw data;

			setArenaPG(data.pg1, data.pg2);

			// TODO
			/**
			 * setTimer e capisci come gestirlo per bene (credo tipo negozio ma da capire)
			 * setEquipment
			 * attack event
			 * updateStatus
			 * arrenditi
			 */
		})
		.catch(error => errorHandler(error));
	
		if(message)
			showMessage(message);
		
		if(errorMessage)
			errorHandler(errorMessage);
});


function setArenaPG(PG1, PG2){
	fetch('images/arena.svg')
        .then(response => response.text())
        .then(svg => {
            document.getElementById('imageContainer').innerHTML = svg;
			document.getElementById('tuoPG').setAttribute("href", PG1.pathImmaginePG);
			document.getElementById('enemyPG').setAttribute("href", PG2.pathImmaginePG);


			const svgDoc = document.querySelector('svg');

			if(PG1.arma)
				insertClippedImage(svgDoc, "arma_pg1", PG1.arma['PathImmagine'], "clipArmaPG1");
			if(PG1.armatura)
				insertClippedImage(svgDoc, "armatura_pg1", PG1.armatura['PathImmagine'], "clipArmaturaPG1");

			if(PG2.arma)
				insertClippedImage(svgDoc, "arma_pg2", PG2.arma['PathImmagine'], "clipArmaPG2");
			if(PG2.armatura)
				insertClippedImage(svgDoc, "armatura_pg2", PG2.armatura['PathImmagine'], "clipArmaturaPG2");

			// Nomi e centratura
			svgDoc.getElementById("nome_pg1").innerHTML = PG1.nome;
			svgDoc.getElementById("nome_pg2").innerHTML = PG2.nome;
			centerSvgElement(svgDoc, "nome_pg1", "PF-box_pg1", false);
			centerSvgElement(svgDoc, "nome_pg2", "PF-box_pg2", false);

        });
}