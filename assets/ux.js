

class Snackbar {
    constructor(msg) {
        this.msg = msg; 
        this.id = this.randomKey(16); 
    }

    display(options = {}) {
        let msg = options.message || this.msg; 
        let autoremove = options.autoremove || true; 
        let delay = options.delay || 4000; 

        this.addStyle(); 

        if (!document.querySelector('.ui-alert__container')) {
            document.body.insertAdjacentHTML('beforeend', `<div class="ui-alert__container"></div>`); 
        }
        
        let newID = this.randomKey(8); 
        document.querySelector('.ui-alert__container').insertAdjacentHTML('afterbegin', `<div id="${newID}" class="ui-alert__content">${msg}<div>`);  

        document.querySelector(`#${newID}`).addEventListener('click', (event) => this.removeAlert(event.currentTarget)); 

        if (autoremove) {
            this.waitFor(delay).then(() => this.removeAlert(document.querySelector(`#${newID}`))); 
        }
    }


    styleContent() {
        return `
            .ui-alert__container {
                width: 480px; 
                left: calc(50% - 240px);
                z-index: 2999; 
            }
            .ui-alert__container { 
                position: fixed;
                bottom: 1em; 
                left: 1em; 
                width: calc(100% - 2em); 
            }

            .ui-alert__content {
                padding: 1em; 
                margin: auto; 
                border: solid 1px #e1e1e1; 
                border-radius: 4px; 
                background-color: #e5f6fd; 
                color: #014361; 
                box-shadow: 4px 4px 12px #0000006b;
            }
            .ui-alert__content + .ui-alert__content {
                margin-top: .4em; 
            }
            .ui-alert__content a {
                font-weight: bold; 
                color: #014361;
                text-decoration: none; 
            }

            .ui-alert__content:hover {
                // animation-name: shake;
                // animation-duration: 320ms;
                // animation-iteration-count: infinite;
            }
            @keyframes shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(6px); }
                50% { transform: translateX(-6px); }
                75% { transform: translateX(6px); }
                100% { transform: translateX(0); }
            }
        `; 
    }

    addStyle() {
        if (!document.querySelector(`#ui-alert__style`)) {
            let style = document.createElement('style'); 
            style.id = "ui-alert__style"; 
            style.textContent = this.styleContent(); 
            document.head.appendChild(style); 
        }
    }

    
    removeAlert(elt, delay = 1640) {
        elt.style.transition = "all ease "+delay+"ms"; 
        elt.style.opacity = 0; 
        this.waitFor(delay)
            .then(() => elt.remove()); 
    }


    waitFor(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(); 
            }, delay); 
        })
    }

    randomKey(length) {
        let possibles = "abcdefghijklmnopqsrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
        let output = ''; 
        for (let i = 0; i < length; i++) {
            output += possibles[Math.floor(Math.random()*possibles.length)]; 
        }
        return output; 
    }
}




















class UserChoice {
    constructor(message = "Voulez-vous continuer ?", confirm = "Confirmer", cancel = "Annuler", input = null, value = null) {
        this.id = this.createHash();  
        this.message = message; 
        this.confirm = confirm; 
        this.cancel = cancel; 
        this.input = input; 
        this.value = value; 
    }

    applyStyle() {
        let style = `
            #popin-${this.id}.user-choice-popin {
                position: fixed;
                top: 0; 
                left: 0; 
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1999; 
            }
            .popin-background {
                position: absolute;
                width: 300%;
                height: 300%;
                background: #282828;
                opacity: .6;
            }
            .popin-content {
                position: absolute;
                max-width: 95%;
                z-index: 1;
                padding: 1em; 
                border-radius: 4px;
                padding-bottom: 0; 
                background: var(--light-gray);
                box-shadow: 4px 4px 24px rgb(0 0 0 / 40%);
            }
            .message__container {
                padding: 1em;
                line-height: 1.6; 
            }
            .btn-container {
                text-align: right;
                border-top: solid 1px #d5d5d5;
                padding: 12px 0;
            }
            #cancel-btn {
                background: transparent;
            }
            #cancel-btn:hover {
                color: #b00020; 
            }
            #confirm-btn:hover {
                background-color: #01579B; 
            }
            
            `; 

        let moreStyle = document.createElement('style'); 
        moreStyle.id = `style-for-${this.id}`; 
        moreStyle.textContent = style; 
        document.head.append(moreStyle); 
    }

    returnTemplate() {
        return `
        <div id="popin-${this.id}" class="user-choice-popin" >
            <div class="popin-content">
                <p class="message__container" id="choice-text">${this.message}</p>
                ${this.input ? `<input type="date" id="date" value="${this.value}">` : '' }
                <div class="btn-container">
                    ${ this.cancel ? `<button id="cancel-btn">${this.cancel}</button>` : ''}
                    ${ this.confirm ? `<button id="confirm-btn">${this.confirm}</button>` : ''}
                </div>
            </div>
            <div class="popin-background"></div>
        </div>`; 
    }

    waitFor() {
        let html = this.returnTemplate(); 
        this.applyStyle(); 
        document.body.insertAdjacentHTML('afterbegin', html); 
        return new Promise((resolve, reject) => {
            if (document.querySelector(`#popin-${this.id} #confirm-btn`)) {
                document.querySelector(`#popin-${this.id} #confirm-btn`).addEventListener('click', event => {
                    let response = ''; 
                    if(document.getElementById('date')) { response = document.getElementById('date').value }; 
                    
                    document.querySelector(`#popin-${this.id}`).remove(); 
                    document.querySelector(`#style-for-${this.id}`).remove(); 
                    
                    resolve(response); 
                })
            }
            if (document.querySelector(`#popin-${this.id} #cancel-btn`)) {
                document.querySelector(`#popin-${this.id} #cancel-btn`).addEventListener('click', event => {
                    document.querySelector(`#popin-${this.id}`).remove(); 
                    document.querySelector(`#style-for-${this.id}`).remove(); 
                    reject(); 
                })
            }
            document.querySelector('.popin-background').addEventListener('click', event => {
                document.querySelector(`#popin-${this.id}`).remove(); 
                document.querySelector(`#style-for-${this.id}`).remove(); 
                reject(); 
            })
        })
    }

    createHash(length = 16) {
        const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMONPQRSTUVWXYZ1234567890"; 
        let res = ''; 
        for (let i = 0; i < length; i++) {
            res += c[ Math.floor(Math.random() * c.length) ]; 
        }
        return res; 
    }

    
}
























class Modale {
    constructor(htmlContent) {
        this.htmlContent = htmlContent; 
        this.id = this.randomKey(16); 
    }

    display(htmlContent = this.htmlContent) {
        this.addStyle(); 
        
        let newID = this.randomKey(18); 
        let modaleHTML = `<div id="${newID}" class="modale__container">
                            <div class="modale__content">
                                <div class="free-area">${htmlContent}</div>
                                <div class="bottom-bar">
                                    <button id="close-${newID}">Fermer</button>
                                </div>
                            </div>
                            <div class="modale__background"></div>
                        </div>`; 

        document.body.insertAdjacentHTML('afterbegin', modaleHTML);  

        document.querySelector(`#${newID} .modale__background`).addEventListener('click', (event) => {
            this.removeAlert(document.querySelector(`#${newID}`)); 
        });
        document.querySelector(`#close-${newID}`).addEventListener('click', (event) => {
            this.removeAlert(document.querySelector(`#${newID}`)); 
        }); 
    }


    styleContent() {
        return `
            .modale__container { 
                position: fixed; 
                width: 100%; 
                height: 100vh; 
                top: 0;
                left: 0;
                z-index: 999; 
            }

            .modale__content {
                padding: 1em; 
                position: fixed;
                bottom: 2em; 
                left: 2em; 
                width: calc(100% - 4em); 
                height: calc(100vh - 4em); 
                margin: auto; 
                background-color: var(--clight); 
                border-radius: 8px; 
                box-shadow: 4px 4px 12px #0000006b;
                z-index: 2; 

                display: flex; 
                flex-direction: column; 

            }
            .modale__content .free-area {
                overflow: auto; 
            }
            .modale__content .bottom-bar {
                margin-top: auto; 
                margin-left: auto; 
                border-top: solid #ddd 1px; 
            }



            .modale__background {
                position: fixed; 
                width: 100%; 
                height: 100vh; 
                top: 0;
                left: 0;
                background-color: #00000069; 
                z-index: 1; 
            }
        `; 
    }

    addStyle() {
        if (!document.querySelector(`#modale__style`)) {
            let style = document.createElement('style'); 
            style.id = "modale__style"; 
            style.textContent = this.styleContent(); 
            document.head.appendChild(style); 
        }
    }

    
    removeAlert(elt, delay = 180) {
        elt.style.transition = "all ease "+delay+"ms"; 
        elt.style.opacity = 0; 
        this.waitFor(delay)
            .then(() => elt.remove()); 
    }


    waitFor(delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(); 
            }, delay); 
        })
    }

    randomKey(length) {
        let possibles = "abcdefghijklmnopqsrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
        let output = ''; 
        for (let i = 0; i < length; i++) {
            output += possibles[Math.floor(Math.random()*possibles.length)]; 
        }
        return output; 
    }
}










class Popover {
    constructor(content, targetElt) {
        this.content = content; 
        this.id = this.randomKey(16); 
        this.targetElt = targetElt; 
        this.width = 320; 
        this.height = 120; 
    }


    htmlTemplate(innerContent) {
        return `<div id="div-for-${this.id}" class="flying-popover">${innerContent}</div>`; 
    }


    customStyle() {
        return `.flying-popover {
            z-index: 3999; 
            position: fixed; 
            bottom: 0; 
            right: 0; 
            background: #fff; 
            color: #212121; 
            border-radius: 8px; 
            padding: 1em;
            box-shadow: 2px 2px 12px #00000069; 
            width: ${this.width}px; 
            height: ${this.height}px; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
        }`; 
    }

    display() {
        let newStyle = `<style id="style-for-popover">${this.customStyle()}</style>`; 
        if (!document.querySelector(`#style-for-popover`)) { document.head.insertAdjacentHTML('beforeend', newStyle) }

        document.body.insertAdjacentHTML('beforeend', this.htmlTemplate(this.content)); 

        let elt = document.querySelector(`#div-for-${this.id}`); 
        window.addEventListener('mousemove', (event) => {
            let positions = {x: event.clientX, y: event.clientY}; 
            this.positionPopover(positions);  
            if (!this.targetElt) { this.removePopover() }
        })
        this.targetElt.addEventListener('mouseout', () => {  
            this.removePopover(); 
        }); 
    }

    positionPopover(mouse_positions) {
        let elt = document.querySelector(`#div-for-${this.id}`); 
        if (!elt) { return }

        let enough_space_right = mouse_positions.x +24+ this.width < document.body.offsetWidth;  
        if (enough_space_right) {
            elt.style.left = mouse_positions.x+24 + 'px'; 
        } else {
            elt.style.left = mouse_positions.x-24-this.width + 'px';
        }

        // let enough_space_bottom = mouse_positions.y +24+ this.height < document.body.offsetHeight;  
        let enough_space_bottom = mouse_positions.y +24+ this.height < window.screen.availHeight;  
        if (enough_space_bottom) {
            elt.style.top = mouse_positions.y+24 + 'px'; 
        } else {
            elt.style.top = mouse_positions.y-24-this.height + 'px';
        }
    }

    removePopover() {
        if (document.querySelector(`#div-for-${this.id}`)) { 
            document.querySelector(`#div-for-${this.id}`).remove(); 
        }
    }


    randomKey(length) {
        let possibles = "abcdefghijklmnopqsrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
        const numbers = '0123456789'; 
        let output = possibles[Math.floor(Math.random()*possibles.length)]; 
        for (let i = 0; i < length-1; i++) {
            let newC = possibles[Math.floor(Math.random()*possibles.length)]; 
            if (Math.random() > 0.5) { newC = numbers[Math.floor(Math.random()*numbers.length)]}
            output = output + newC; 
        }
        return output; 
    }
}