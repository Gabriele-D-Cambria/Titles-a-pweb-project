"use strict";

export const patterns = {
    USERNAME : "^[a-zA-Z][a-zA-Z0-9_.]{2,9}$",
    //? source: https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    PASSWORD: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$"
    //? endsource
};

export const IMPORTANT_MESSAGE = 4000;

/**
 * Indica la funzione di listener per rimuovere i moduli in sovraimpressione
 */
export let moduleListener = null;

/**
 * Contiene gli item restituiti dalla box aperta
 */
let openedItems = [];

/**
 * Indica quale item è stato selezionato dall'utente per venire mostrato nel dettaglio
 */
let shownItem = null;

/**
 * Indica se nel dettaglio è presente una box, necessaria per poterla aprire da tastiera
 */
export let openBoxSelected = false;

/**
 * Timer del negozio
 */
let shopTimerInterval = null;

/**
 * Contiene l'id del modulo aperto in un determinato momento
 */
let currentlyOpened = null;



/**
 * Crea un input per l'username con le relative proprietà e validazioni.
 * @param {String} id - L'id da assegnare all'input.
 * @param {String} labelTxt - Il testo del label associato.
 * @returns {Object} Un oggetto contenente il label e l'input creati.
 */
export function createUsernameInput(labelTxt){
    const label = document.createElement("label");
    const input = document.createElement("input");

    label.for = "username";
    label.innerText = labelTxt;
    input.type = "text";
    input.id = input.name = "username";
    input.toggleAttribute("required", true);

    input.pattern = patterns.USERNAME;
    input.title = "Deve iniziare con una lettera e avere tra 3 e 10 caratteri (lettere, punti o underscore).";
    input.placeholder = "User.0_";
    input.autocomplete = "off";
    input.addEventListener("input", validateForm);

    return {
        "label" : label,
        "input" : input
    };
}

/**
 * Crea un input per la password con un pulsante per mostrare/nascondere il contenuto.
 * @param {String} labelTxt - Il testo del label associato.
 * @param {Boolean} [isConfirm=false] - Indica se si tratta di un campo di conferma password.
 * @returns {Object} Un oggetto contenente il label e il contenitore della password.
 */
export function createPasswordInput(labelTxt, isConfirm = false) {
    const label = document.createElement("label");
    const passwordContainer = document.createElement("div");
    const input = document.createElement("input");
    const toggleBtn = document.createElement("button");

    label.for = (isConfirm)? "confirmPassword" : "password";
    label.innerText = labelTxt;

    passwordContainer.classList.add("password-container");

    input.type = "password";
    input.id = input.name = (isConfirm)? "confirmPassword" : "password";
    input.toggleAttribute("required", true);
    input.pattern = patterns.PASSWORD;

    input.title = (isConfirm)? "Deve essere uguale alla password." : "Deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero e un carattere speciale.";

    input.placeholder = isConfirm ? "Conferma" : "Password";
    input.addEventListener("input", validateForm);
    if(isConfirm)
        input.classList.toggle("invalid", true);

    passwordContainer.appendChild(input);

    toggleBtn.type = "button";
    toggleBtn.innerText = "Mostra";
    toggleBtn.classList.add("toggle-password");
    toggleBtn.addEventListener("click", (e) => {
        hideShow(e.target, isConfirm);
    });
    passwordContainer.appendChild(toggleBtn);

    return {
        "label": label,
        "passwordContainer": passwordContainer
    };
}

/**
 * Crea un pulsante con le proprietà specificate.
 * @param {String} type - Il tipo del pulsante (es. "button", "submit").
 * @param {String} id - L'id da assegnare al pulsante.
 * @param {String} text - Il testo da visualizzare sul pulsante.
 * @param {Function} [onClick] - La funzione da eseguire al click del pulsante.
 * @returns {HTMLButtonElement} Il pulsante creato.
 */
export function createButton(type, id, text, onClick) {
    const btn = document.createElement("button");
    btn.type = type;
    btn.id = id;
    btn.innerText = text;
    if (onClick) {
        btn.addEventListener("click", onClick);
    }
    return btn;
}

/**
 * Valida i campi del modulo (username, password, conferma password) e abilita/disabilita il pulsante di submit.
 */
export function validateForm(){
    let usr = document.getElementById("username");
    let psw = document.getElementById("password");
    let psw2 = document.getElementById("confirmPassword");
    let btn = document.getElementById("submit");
    let invalid = false;

    if(psw2 !== null && psw !== null){
        if(psw2.value === psw.value && psw.value !== ""){
            psw2.classList.toggle("invalid", false);
            psw2.classList.toggle("valid", true);
        }
        else{
            psw2.classList.toggle("valid", false);
            psw2.classList.toggle("invalid", true);
            invalid = true;
        }
    }

    if(usr !== null && !usr.checkValidity()){
        invalid = true;
    }

    if(psw !== null && !psw.checkValidity()){
        invalid = true;
    }

    btn.toggleAttribute("disabled", invalid);
}

/**
 * Mostra o nasconde il contenuto di un campo password.
 * @param {HTMLElement} target - L'elemento che ha generato l'evento (es. pulsante toggle).
 * @param {Boolean} [confirm=false] - Indica se si tratta del campo di conferma password.
 */
export function hideShow(target, confirm = false){
    let input;
    input = document.getElementById((confirm)? "confirmPassword" : "password");

    if (input.type === "password") {
        input.type = "text";
        target.innerText = "Nascondi";
    } else {
        input.type = "password";
        target.innerText = "Mostra";
    }
}

/**
 * Mostra un modulo in sovraimpressione.
 * @param {String} id - L'id del modulo da visualizzare.
 * @param {Boolean} [showCoins=false] - Indica se portare in risalto le monete.
 */
export function showModule(id, showCoins = false){
    let module = document.getElementById(id);
    if(showCoins){
        const coins = document.querySelector(".coin-display");
        coins.style = "z-index: 2";
    }
    module.classList.add("show");
}

/**
 * Nasconde ed elimina il contenuto di un modulo in sovraimpressione.
 * @param {Event} event - L'evento che ha generato l'azione.
 * @param {String} id - L'id del modulo da rimuovere.
 * @param {Boolean} [override=false] - Indica se ignorare i controlli.
 * @param {Boolean} [showCoins=false] - Indica se rimuovere il focus sulle monete.
 * @returns {Boolean} True se la rimozione ha avuto effetto, altrimenti false.
 */
export function closeModule(event, id, override = false, showCoins = false) {
    const module = document.getElementById(id);
    if (override || event.target === module) {
        module.classList.remove("show");
        if(showCoins){
            const coins = document.querySelector(".coin-display");
            coins.style = "z-index: 0";
        }

        while(module.childElementCount)
            module.removeChild(module.firstChild);


        return true;
    }
    return false;
}

/**
 * Mostra un messaggio temporaneo sullo schermo che si rimuove automaticamente dopo 5 secondi.
 * @param {String} messaggio - Il testo del messaggio da visualizzare.
 * @param {Number} showTime - Per quanto tempo il messaggio rimane visibile
 */
export function showMessage(messaggio, showTime = 1500) {
    let messageContainer = document.createElement("div");
    messageContainer.id = "messageBox";
    messageContainer.classList.add("messaggio");
    if(showTime === IMPORTANT_MESSAGE){
        messageContainer.classList.add("errore");
    }
    messageContainer.innerText = messaggio;
    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.style.opacity = 0;
        messageContainer.style.transform = "translateY(-20px)";
    }, showTime);

    setTimeout(() => {
        document.body.removeChild(messageContainer);
    }, showTime + 3000);
}

/**
 * Gestisce un errore mostrando un messaggio all'utente e registrando l'errore nella console.
 * @param {Object} error - Oggetto JSON che rappresenta l'errore da gestire, deve necessariamente avere i due campi sotto, può averne altri opzionali che non verranno valutati
 * @param {string} error[].message - Il messaggio descrittivo dell'errore.
 * @param {string|number} error[].errorcode - Il codice identificativo dell'errore.
 */
export function errorHandler(error){
    showMessage(error.message, IMPORTANT_MESSAGE);
    console.error(`Errore: ${error.errorcode}: ${error.message}`);
}

/**
 * Crea un elemento HTML con le proprietà specificate.
 * @param {String} type - Il tipo dell'elemento (es. "div", "span").
 * @param {String} [className] - La classe CSS da assegnare all'elemento.
 * @param {String} [id] - L'id da assegnare all'elemento.
 * @param {String} [innerText] - Il testo da inserire nell'elemento.
 * @returns {HTMLElement} L'elemento creato.
 */
export function createHTMLElement(type, className, id, innerText){
    const el = document.createElement(type);
    if(className)
        el.classList.add(className);
    if(id)
        el.id = id;
    if(innerText)
        el.innerText = innerText;

    return el;
}

/**
 * Mostra l'inventario dell'utente, recuperandolo tramite una richiesta API.
 * @param {Boolean} newItems Indica se evidenziare gli oggetti appena ottenuti
 * @param {Boolean} equipment Indica l'inventario serve per equipaggiare oggetti (`true`) o per la sua gestione (Default: `false`)
 * @param {Array} Array contenente i tipi degli elementi da raccogliere
 */
export function showInventory(newItems = false, equipment = false, filterObj = null) {
    if (currentlyOpened !== null && currentlyOpened !== "inventoryModule")
        return;

    const module = document.getElementById("inventoryModule");
    currentlyOpened = module.id;
    
    const formData = new FormData();
    formData.append("filter", JSON.stringify(filterObj));

    document.body.classList.add("caricamento");
    fetch('php/API/getInventory.php', {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(risposta => {
            document.body.classList.remove("caricamento");
            if (risposta.error !== undefined && risposta.error) {
                throw risposta;
            }
            const data = risposta["inventario"];
            const MAX_SIZE = risposta["MAX_SIZE"];

            const page = document.createElement("div");
            page.classList.add("inventory-page");

            const container = document.createElement("div");
            container.classList.add("inventory-container");

            let objCount = data.length;

            data.slice().forEach((item, index) => {
                const space = createItemSlot(item, index, newItems);
                space.addEventListener("click", (e) => {
                    const id = String(e.target.id).replace(/^(img-|ic-)/, "");
                    const info = generateInfo("inventory-info", data[id], true, equipment);
                    changeItemInfo(info);
                });
                container.appendChild(space);
            });

            for(; objCount < MAX_SIZE; ++objCount){
                const space = document.createElement("div");
                space.classList.add("item-slot");

                container.appendChild(space);
            }

            page.appendChild(container);

            const info = generateInfo("inventory-info", shownItem);

            page.appendChild(info);

            closeModule(null, module.id, true, false);
            module.appendChild(page);
            if(!equipment){
                const coins = document.querySelector(".coin-display");
                coins.style = "z-index: 2";
            }

            showModule(module.id, !equipment);
            moduleListener = (e) => {
                closeModuleEvent(e, "inventoryModule", false, !equipment);
            };
            window.addEventListener("click", moduleListener);
            ;
        })
        .catch(error => {
            errorHandler(error);
            return null;
        });
}

/**
 * Crea uno slot per un oggetto dell'inventario.
 * @param {Object} item - L'oggetto dell'inventario.
 * @param {Number} id - L'id dello slot.
 * @param {Boolean} newItems - Indica se evidenziare gli oggetti appena ottenuti.
 * @returns {HTMLElement} Lo slot creato.
 */
export function createItemSlot(item, id, newItems) {
    const space = document.createElement("div");
    space.classList.add("item-slot");
    space.id = id;

    if (newItems && openedItems.includes(item.ID)) {
        space.classList.add("newItem");
    }

    const img = createHTMLElement("img");
    img.id = `img-${id}`;
    img.src = item.PathImmagine;
    img.alt = item.Descrizione;
    space.appendChild(img);

    const count = createHTMLElement("div");
    count.classList.add("item-count");
    count.id = `ic-${id}`;
    count.innerText = item.Quantita;
    space.appendChild(count);

    return space;
}

/**
 * Genera un elemento HTML aside contenente le informazioni di un oggetto.
 * @param {String} id ID da assegnare all'aside
 * @param {Array} item Oggetto per il quale generare le informazioni (`null` se assente)
 * @param {Boolean} hasIt Indica se l'oggetto è già di proprietà dell'utente (Default: `true`)
 * @param {Boolean} equipment Qualora `hasIt = true`, sancisce se l'oggetto deve essere equipaggiato (`true`) oppure va venduto (Default: `false`)
 * @returns {HTMLElement} Elemento HTML aside contenente le informazioni
 */
export function generateInfo(id, item = null, hasIt = true, equipment = false){
    shownItem = item;
    openBoxSelected = false;
    const container = document.createElement("aside");
    container.id = id;

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

        el = document.createElement("div");

        if(hasIt && item.Tipologia === "box"){
            const open = document.createElement("button");
            open.id = "open";
            open.innerText = "Apri";

            open.addEventListener("click", openBox);
            openBoxSelected = true;

            el.appendChild(open);
        }
        else if(item.Tipologia !== "box"){
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
                    modificatore = "ProtezioneDanno";
                    txt = "Classe Armatura";
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
            td.innerText = "Modificatore DES";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerText = item.ModificatoreDes;
            tr.appendChild(td);

            table.appendChild(tr);
            el.appendChild(table);
        }
        else{
            const div = document.createElement("div");
            el.appendChild(div);
        }

        container.appendChild(el);

        el = document.createElement("footer");

        let btn = document.createElement("button");
        if(hasIt){
            if(equipment){
                btn.id = "equip-btn";
                btn.innerText = "Equipaggia";
                btn.addEventListener("click", equipItem);
            }
            else{
                btn.id = "sell-btn";
                btn.innerText = "Vendi: " + Math.floor(item.Costo / 2) + "🪙";
                btn.addEventListener("click", sellItem);
            }
        }
        else{
            btn.id = "buy-btn";
            btn.innerText = "Compra: " + item.Costo + "🪙";
            btn.addEventListener("click", buyItem);
        }

        el.appendChild(btn);
        btn = document.createElement("button");
        btn.innerText = "Chiudi";
        btn.addEventListener("click", () => {
            let info = generateInfo(id);
            changeItemInfo(info);
            shownItem = null;
        });
        el.appendChild(btn);

        container.appendChild(el);
    }

    return container;
}

/**
 * Aggiorna la sezione dettagli del modulo attualmente aperto con i dettagli di un oggetto selezionato.
 * @param {HTMLElement} info Elemento HTML contenente le nuove informazioni dell'oggetto
 */
export function changeItemInfo(info){
    if(currentlyOpened === null)
        return
    let module = document.getElementById(currentlyOpened);
    module = module.firstChild;
    module.removeChild(module.lastChild);
    module.appendChild(info);
}

/**
 * Effettua una richiesta API per vendere un oggetto selezionato.
 */
function sellItem(){
    if(currentlyOpened !== "inventoryModule"){
        showMessage("Impossibile vendere un oggetto da questa interfaccia");
        return;
    }
    if(!shownItem){
        showMessage("Nessun Oggetto da Vendere");
        return;
    }
    document.body.classList.add("caricamento");
    fetch('php/API/sellItem.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            "itemId": shownItem.ID
        })
    })
    .then(response => response.json())
    .then(data => {
        document.body.classList.remove("caricamento");
        if(data.error !== undefined && data.error){
            throw data;
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
        errorHandler(error);
        return;
    });
}

/**
 * Aggiorna il contatore delle monete dell'utente.
 * @param {Number} amount Quantità di monete da aggiungere o sottrarre
 */
export function updateCoins(amount){
    let coins = document.getElementById("coin-count");
    coins.innerText = Number(coins.innerText) + amount;
}

/**
 * Effettua una richiesta API per aprire una box e recuperare i nuovi oggetti.
 */
export function openBox(){
    if(currentlyOpened !== "inventoryModule")
        return;

    if(shownItem.Tipologia !== "box"){
        showMessage("Oggetto Non apribile");
        return;
    }

    document.body.classList.add("caricamento");
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
        document.body.classList.remove("caricamento");
        if(data.error !== undefined && data.error){
            throw data;
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
            showInventory(currentlyOpened, true);
            showMessage(`Box Aperta! | +${data.guadagno}🪙`);
        }
    })
    .catch(error => {
        errorHandler(error);
        return;
    });
}

/**
 * Chiude un modulo sopraelevato (overlay) dal DOM.
 * @param {Event} event Evento generatore
 * @param {String} id ID del modulo da rimuovere
 * @param {Boolean} overload Indica se effettuare il controllo sull'evento
 * @param {Boolean} coins Indica se è presente il counter di monete da rimuovere o meno.
 */
export function closeModuleEvent(event, id, overload = false, coins = true) {
    if (moduleListener === null || currentlyOpened !== id)
        return;

    const module = document.getElementById(id);
    if (overload || event.target === module) {
        window.removeEventListener("click", moduleListener);
        moduleListener = null;
        openBoxSelected = false;
        shownItem = null;
        currentlyOpened = null;
        if (shopTimerInterval !== null) {
            clearInterval(shopTimerInterval);
            shopTimerInterval = null;
        }
        closeModule(null, id, true, coins);
    }
}


/**
 * Mostra il menu principale con le opzioni per cambiare username, cambiare password o eliminare l'account.
 */
export function showMenu() {
    if (currentlyOpened !== null && currentlyOpened !== "menuModule") {
        return;
    }

    const module = document.getElementById("menuModule");
    currentlyOpened = module.id;
    
    const page = document.createElement("div");
    page.classList.add("menu-page");

    const menuOptions = [
        {
            id: "changeImg",
            text: "Cambia Immagine",
            action: changeImage
        },
        {
            id: "changeUsr",
            text: "Cambia Username",
            action: changeUsername
        },
        {
            id: "changePwd",
            text: "Cambia Password",
            action: changePassword
        },
        {
            id: "deleteAccount",
            text: "Elimina Account",
            action: deleteAccount
        }
    ];

    menuOptions.forEach((option) => {
        const div = document.createElement("div");
        div.classList.add("menu-space");

        const p = document.createElement("p");
        p.id = option.id;
        p.innerText = option.text;
        p.addEventListener("click", option.action);
        div.appendChild(p);
        page.appendChild(div);
    });

    closeModule(null, "menuModule", true);
    module.appendChild(page);
    showModule(module.id);
    moduleListener = (e) => {
        closeModuleEvent(e, "menuModule");
    };
    window.addEventListener("click", moduleListener);
    ;
}

/**
 * Mostra il modulo per cambiare l'username dell'utente.
 */
function changeUsername(){
    if(currentlyOpened !== "menuModule"){
        return;
    }

    const module = document.getElementById("menuModule");

    const page = document.createElement("div");
    page.classList.add("username-page");

    let space = document.createElement("div");
    space.classList.add("menu-space");
    space.classList.add("header");

    let el = document.createElement("h2");
    el.innerText = "Username Attuale:";
    space.appendChild(el);

    el = document.createElement("p");
    el.innerText = USERNAME;

    space.appendChild(el);
    page.appendChild(space);

    space = document.createElement("div");
    space.classList.add("menu-space");

    const form = document.createElement("form");
    form.classList.add("username");
    form.action = "php/changeCredentials.php";
    form.method = "POST";

    el = createUsernameInput("Nuovo Username:");
    form.appendChild(el.label);
    form.appendChild(el.input);

    el = createButton("submit", "submit", "Conferma");
    el.toggleAttribute("disabled", true);
    form.appendChild(el);

    el = createButton("button", "backToMenu", "Annulla", showMenu);
    form.appendChild(el);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    module.appendChild(page);
}

/**
 * Mostra il modulo per cambiare la password dell'utente.
 */
function changePassword(){
    if(currentlyOpened !== "menuModule"){
        return;
    }

    const module = document.getElementById("menuModule");

    const page = document.createElement("div");
    page.classList.add("password-page");

    let space = document.createElement("div");
    space.classList.add("menu-space");
    space.classList.add("header");

    let el = document.createElement("h2");
    el.innerText = "Cambio Password";
    space.appendChild(el);

    page.appendChild(space);

    space = document.createElement("div");
    space.classList.add("menu-space");

    const form = document.createElement("form");
    form.classList.add("password");
    form.action = "php/changeCredentials.php";
    form.method = "POST";

    el = createPasswordInput("Nuova Password:", false);
    form.appendChild(el.label);
    form.appendChild(el.passwordContainer);

    el = createPasswordInput("Conferma Password:", true);
    form.appendChild(el.label);
    form.appendChild(el.passwordContainer);

    el = createButton("submit", "submit", "Conferma");
    el.toggleAttribute("disabled", true);
    form.appendChild(el);

    el = createButton("button", "backToMenu", "Annulla", showMenu);
    form.appendChild(el);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    module.appendChild(page);
}

/**
 * Mostra il modulo per eliminare l'account dell'utente.
 */
function deleteAccount(){
    if(currentlyOpened !== "menuModule"){
        return;
    }

    const module = document.getElementById("menuModule");

    const page = document.createElement("div");
    page.classList.add("delete-page");

    let space = document.createElement("div");
    space.classList.add("menu-space");
    space.classList.add("header");

    let el = document.createElement("h2");
    el.innerText = "Stai per Eliminare l'account";
    space.appendChild(el);

    el = document.createElement("p");
    el.innerText = "Sei sicuro?";

    space.appendChild(el);
    page.appendChild(space);

    space = document.createElement("div");
    space.classList.add("menu-space");

    const form = document.createElement("form");
    form.action = "php/changeCredentials.php";
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
    el.innerText = "Eliminando l'account ";
    const boldText = document.createElement("b");
    boldText.innerText = "perderai in maniera definitiva tutti i tuoi progressi";
    el.appendChild(boldText);
    el.appendChild(document.createTextNode(", sei sicuro di volerlo fare?"));
    form.appendChild(el);

    const aside = document.createElement("aside");
    aside.classList.add("button-holder");

    el = createPasswordInput("Conferma con Password:");
    aside.appendChild(el.label);
    aside.appendChild(el.passwordContainer);

    el = createButton("submit", "submit", "Elimina");
    el.toggleAttribute("disabled", true);
    aside.appendChild(el);

    el = createButton("button", "backToMenu", "Annulla", showMenu);
    aside.appendChild(el);
    form.appendChild(aside);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    module.appendChild(page);
}

/**
 * Mostra il modulo per cambiare l'immagine dell'utente
 */
function changeImage(){
    if(currentlyOpened !== "menuModule"){
        return;
    }

    const module = document.getElementById("menuModule");
    document.body.classList.add("caricamento");
    fetch('php/API/getElementPics.php')
        .then(risposta => risposta.json())
        .then(images => {
            document.body.classList.remove("caricamento");
            if(images.error !== undefined && images.error){
                throw images;
            }
            const page = document.createElement("div");
            page.classList.add("image-page");

            let space = document.createElement("div");
            space.classList.add("menu-space");
            space.classList.add("header");

            let el = document.createElement("h2");
            el.innerText = "Cambia Immagine:";
            space.appendChild(el);
            page.appendChild(space);

            space = document.createElement("div");
            space.classList.add("menu-space");

            const form = document.createElement("form");;
            form.classList.add("image");
            form.action = "php/changeCredentials.php";
            form.method = "POST";

            el = document.createElement("div");
            el.classList.add("choose-box");

            images.forEach((imagePath, index) => {
                const imageName = imagePath.split('/').pop();
                const option = document.createElement("div");
                option.classList.add("image-option");

                let tmp = document.createElement("input");
                tmp.type = "radio";
                tmp.id = `pic-${index}`;
                tmp.name = "newPic";
                tmp.value = imagePath;
                tmp.toggleAttribute("required", true);

                if(imageName === document.getElementById("userPic").src.split('/').pop())
                    tmp.toggleAttribute("checked", true);

                option.appendChild(tmp);

                tmp = document.createElement("label");
                tmp.setAttribute('for', `pic-${index}`)

                const img = document.createElement("img");
                img.src = imagePath;
                img.alt = `Pic ${imageName}`;
                img.draggable = false;

                tmp.appendChild(img);
                option.appendChild(tmp);

                el.appendChild(option);
            });
            form.appendChild(el);

            el = createButton("submit", "submit", "Conferma");
            form.appendChild(el);

            el = createButton("button", "backToMenu", "Annulla", showMenu);
            form.appendChild(el);

            space.appendChild(form);
            page.appendChild(space);

            while(module.childElementCount){
                module.removeChild(module.lastChild);
            }

            module.appendChild(page);
        })
        .catch(error => {
            errorHandler(error);
            return;
        });
}

/**
 * Funzione di supporto per creare uno slot negozio per un oggetto.
 * @param {Array} item Oggetto da visualizzare
 * @param {Number} id Indice da assegnare all'oggetto
 * @returns {HTMLElement} Elemento HTML rappresentante lo slot dell'oggetto nel negozio
 */
function createShopSlot(item, id){
    const space = document.createElement("div");
    space.classList.add("shop-slot");
    space.id = id;

    const img = document.createElement("img");
    img.id = `img-${id}`;
    img.src = item.PathImmagine;
    img.alt = item.Descrizione;
    space.appendChild(img);

    const caption = document.createElement("div");
    caption.id = `cap-${id}`;
    caption.innerText = `${item.Costo}🪙`;
    space.appendChild(caption);

    return space;
}

/**
 * Mostra il negozio dell'utente, recuperandolo tramite una richiesta API.
 */
export function showShop(){
    if(currentlyOpened !== null && currentlyOpened !== "shopModule")
        return;
    const module = document.getElementById("shopModule");
    currentlyOpened = module.id;
    
    shownItem = null;
    if(shopTimerInterval !== null){
        clearInterval(shopTimerInterval);
        shopTimerInterval = null;
    }

    document.body.classList.add("caricamento");
    fetch('php/API/getShopItems.php')
        .then(response => response.json())
        .then(risposta => {
            document.body.classList.remove("caricamento");
            if(risposta.error !== undefined && risposta.error){
                throw risposta;
            }
            const data = risposta.items;
            const remainingTime = risposta.remainingTime;

            const page = document.createElement("div");
            page.classList.add("shop-page");

            const container = document.createElement("div");
            container.classList.add("shop-container");

            let el = document.createElement("header");
            el.classList.add("timer-container");

            const p = document.createElement("p");
            p.classList.add("timer");
            p.innerText = `Prossimo Refresh \u2003 - \u2003`

            const span = document.createElement("span");
            span.id = "timer";

            span.innerText =  `${remainingTime.minutes}:${remainingTime.seconds}`;

            shopTimerInterval = setInterval(updateShopTimer, 1000);

            p.appendChild(span);
            el.appendChild(p);

            container.appendChild(el);

            el = document.createElement("div");
            el.classList.add("shop-slots");

            data.slice().forEach((item, index) => {
                const space = createShopSlot(item, index);

                space.addEventListener("click", (e) => {
                    const id = String(e.target.id).replace(/^(img-|cap-)/, "");
                    const info = generateInfo("shop-info", data[id], false);
                    changeItemInfo(info);
                });

                el.appendChild(space);
            });

            container.appendChild(el);
            page.appendChild(container);

            const info = generateInfo("shop-info", shownItem, false);

            page.appendChild(info);

            closeModule(null, module.id, true, false);
            module.appendChild(page);
            showModule(module.id, true);
            moduleListener = (e) => {
                closeModuleEvent(e, "shopModule");
            };

            window.addEventListener("click", moduleListener);
            ;
        })
        .catch(error => {
            errorHandler(error);
            return null;
        });


}

/**
 * Aggiorna il timer del negozio, mostrando il tempo rimanente al prossimo refresh.
 */
function updateShopTimer(){
    const span = document.getElementById("timer");
    if(span === null){
        clearInterval(shopTimerInterval);
        shopTimerInterval = null;
        return;
    }
    let [minutes, seconds] = span.innerText.split(":").map(Number);
    if(minutes === 0 && seconds === 0){
        clearInterval(shopTimerInterval);
        showShop();
        return;
    }
    else {
        if(seconds === 0){
            --minutes;
            seconds = 59;
        }
        else{
            --seconds;
        }
        span.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
}

/**
 * Effettua una richiesta API per acquistare un oggetto selezionato dal negozio.
 */
function buyItem(){
    if(currentlyOpened !== "shopModule"){
        showMessage("Impossibile acquistare un oggetto da questa interfaccia");
        return;
    }
    if(!shownItem){
        showMessage("Nessun Oggetto da Acquistare");
        return;
    }
    document.body.classList.add("caricamento");
    fetch('php/API/buyItem.php', {
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
        document.body.classList.remove("caricamento");
        if(data.error !== undefined && data.error){
            throw data;
        }
        else{
            updateCoins(data.spesa);
            showMessage(`Acquisto effettuato | ${data.spesa}🪙`);
        }
    })
    .catch(error => {
        errorHandler(error);
        return;
    });
}

export function createDeleteBox(){
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
        closeModuleEvent(null, module.id, true, false);
    });
    
    aside.appendChild(el);
    form.appendChild(aside);

    space.appendChild(form);
    page.appendChild(space);

    while(module.childElementCount){
        module.removeChild(module.lastChild);
    }

    closeModule(null, module.id, true, false);
    module.appendChild(page);
    showModule(module.id);
    moduleListener = (e) => {
        closeModuleEvent(e, module.id, false, false);
    };
    window.addEventListener("click", moduleListener);
}

function equipItem(){
    console.log(shownItem);
    const formData = new FormData();
    formData.append("itemId", Number(shownItem.ID));

    fetch("php/API/togglePGItem.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(esito =>{
        if(esito.error !== undefined && esito.error === true){
            throw esito;
        }
        window.location.reload();
    })
    .catch(error =>{
        errorHandler(error);
    });
}