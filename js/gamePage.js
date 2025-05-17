"use strict";

document.addEventListener("DOMContentLoaded", () => {
	setArena();
});


function setArena(){
	fetch('./images/arena.svg')
        .then(response => response.text())
        .then(svg => {
            document.getElementById('imageContainer').innerHTML = svg;
			document.getElementById('tuoPG').setAttribute("href", "images/characters/acqua.svg");
			document.getElementById('enemyPG').setAttribute("href", "images/characters/fuoco.svg");
        });
}