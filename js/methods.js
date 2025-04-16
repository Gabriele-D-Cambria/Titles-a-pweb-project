"use strict";

export function showModule(id){
    let module = document.getElementById(id);

    module.classList.add("show");
}

export function closeModule(event, id, override = false) {
    const module = document.getElementById(id);
    if (override || event.target === module) {
        
        module.classList.remove("show");


        while(module.childElementCount){
            module.removeChild(module.firstChild);
        }

        return true;
    }

    return false;
}

export function showMessage(messaggio) {
    let messageContainer = document.createElement("div");
    messageContainer.id = "messageBox";
    messageContainer.classList.add("messaggio");
    messageContainer.innerText = messaggio;
    document.body.appendChild(messageContainer);
    
    setTimeout(() => {
        messageContainer.style.opacity = 0;
        messageContainer.style.transform = "translateY(-20px)";
    }, 1000);

    setTimeout(() => {
        document.body.removeChild(messageContainer);
    }, 4000);
}


export function createElement(type, className, id, innerText){
    const el = document.createElement(type);
    if(className){
        el.classList.add(className);
    }
    if(id)
        el.id = id;
    if(innerText)
        el.innerText = innerText;

    return el;
}