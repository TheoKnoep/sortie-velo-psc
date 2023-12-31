
let channel = new BroadcastChannel('filter-map'); 
const APP_CONTAINER = document.querySelector('.tracks-block'); 
// const PATH = "sortie-velo-psc"; 
const PATH = getPathOfURL(location); 


const ICONS = {
	start: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`, 
	elevation: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mountain"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`, 
	direction: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move-up-right"><path d="M13 5H19V11"/><path d="M19 5L5 19"/></svg>`, 
	infos : (size) => {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`; 
	}
}


const TEMPLATES = {
	track_card: (data) => {
		return `<div class="track__item" data-id="${data._id}">
			<div class="main-line">
				<div class="map-container" data-connect-id="${ data['connect_id'] }"></div>
				<h2 class="title"><span class="distance">${Math.round(data.details.distance.value)}km</span> <span class="name">${data.details.name}</span></h2>
				<div class="text-container">
					<p class="description">${data['Notes']}</p>
				</div>
				<div class="meta-line">
					<div class="direction"><span class="bold">${ICONS.direction}&nbsp;Direction</span> : ${data['Direction']}</div>
					<div class="rdv"><span class="bold">${ICONS.start}&nbsp;Départ</span> : ${data['RDV']}</div>
					<div class="elevation"><span class="bold">${ICONS.elevation}&nbsp;Dénivelé</span> : ${data.details.elevation.value}&nbsp;m</div>
					<div class="score"><span class="bold">Difficulté</span> : ${data.details.score.value}&nbsp;<span class="more-info" onclick="openDificultyInfo()" style="cursor: pointer; position: relative; top: 3px;">${ICONS.infos(18)}</span></div>
				</div>

			</div>
			<div class="secondary-line">
				<a class="button-link gpx-link" href="${location.origin + '/' + PATH + '/tracks/' + data['connect_id'] + '.gpx'}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>&nbsp;.GPX</a>
				<a class="button-link garmin-connect-link" href="${data['Lien garmin connect']}" target="_blank"><span style="background-image: url('assets/images/ico-connect.png'); width: 16px; height: 16px;"></span>&nbsp;Garmin Connect</a>
			</div>
		</div>`; 
	}
}




window.addEventListener('DOMContentLoaded', initialLoad); 




// synchronze in background : 
fetch('synchronize.php')
.then(res => res.text()) 
.then(text => {
	console.log(text); 
	if (text === 'data_changed') {
		new Snackbar(`<div style="display: flex; align-items: center; justify-content: space-between"><span>De nouvelles traces sont disponibles</span><a style="margin-left: auto; font-style: italic;" href="javascript:initialLoad(true)">Recharger la page ?</a></div>`).display({delay: 10000}); 
	}
}); 





function initialLoad(reload = false) {
	fetch('data.json')
	.then(res => res.json())
	.then(json => {
		// console.log(json); 
		document.data = json; 
		APP_CONTAINER.innerHTML = ''; 
		json.forEach(item => {
			APP_CONTAINER.insertAdjacentHTML('beforeend', TEMPLATES.track_card(item)); 
		})

		populateFilter(json); 
		listenFilterForm(); 
		displayNumberOfTrack(json.length); 
	
		document.querySelectorAll('.map-container').forEach(map => {
			displayMap(map, map.dataset.connectId, 120); 
		})

		if (reload) {
			// reload global map ifram content : 
			let iframe = document.querySelector('.global-map iframe'); 
			iframe.contentDocument.location.reload();
		}
	}); 
}

function displayMap(target, connect_id, dimension) {
	let template = `<div class="track-view" style="position: relative; height: ${dimension}px;">
		<iframe src="${location.origin}/${PATH}/map/?track=${connect_id}" frameborder="0" width="${dimension}" height="${dimension}" scrolling="no" style="position: absolute; border-radius: 8px;"></iframe>
		<div class="mask" onclick="window.open('${location.origin}/${PATH}/map/?track=${connect_id}&size=fullscreen', '_blank');" style="width: ${dimension}px; height: ${dimension}px; position: absolute; cursor: pointer; "></div>
		<div class="ico-expand" style="position: absolute; top: 3px; right: 3px; z-index: 1;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/></svg></div>
	</div>`; 
	target.innerHTML = ''; 
	target.insertAdjacentHTML('beforeend', template); 


}


function populateFilter(data) {
	let directions = []; 
	let departs = []; 

	data.forEach(item => {
		if (directions.indexOf(item['Direction']) < 0) {
			directions.push(item['Direction']); 
		}
		if (departs.indexOf(item['RDV']) < 0) {
			departs.push(item['RDV']); 
		}
	})

	let filterHTML = document.querySelector('#filters'); 

	let departOptions = '<option></option>'; 
	departs.forEach(option => {
		departOptions += `<option value="${option}">${option}</option>`; 
	})
	filterHTML.querySelector('#depart').innerHTML = departOptions; 

	let directionOptions = '<option></option>'; 
	directions.forEach(option => {
		directionOptions += `<option value="${option}">${option}</option>`; 
	})
	filterHTML.querySelector('#direction').innerHTML = directionOptions; 
}


function listenFilterForm() {
	let filterForm =  document.querySelector('#filters'); 

	filterForm.addEventListener('input', event => {
		let filters = {
			"direction": null, 
			"depart": null, 
			"distance_min": null, 
			"distance_max": null
		}

		if (filterForm.querySelector('#direction').value) {
			filters.direction = filterForm.querySelector('#direction').value; 
		}
		if (filterForm.querySelector('#depart').value) {
			filters.depart = filterForm.querySelector('#depart').value; 
		}
		if (filterForm.querySelector('#distance-min').value) {
			filters.distance_min = filterForm.querySelector('#distance-min').value; 
		}
		if (filterForm.querySelector('#distance-max').value) {
			filters.distance_max = filterForm.querySelector('#distance-max').value; 
		}

		let arrayOfIDsToDisplay = listOfIDsForFilter(filters); 
		displayOnly(arrayOfIDsToDisplay); 
		displayNumberOfTrack(arrayOfIDsToDisplay.length); 

		let connect_id_to_display = listOfIDsForFilter(filters, 'connect_id'); 
		channel.postMessage(connect_id_to_display);  

	})
}


function listOfIDsForFilter(filterObject, type = 'id') {
	let all = [...document.data];
	
	if (filterObject.direction) {
		all = all.filter(item => {
			return item['Direction'] === filterObject.direction; 
		})
	}

	if (filterObject.depart) {
		all = all.filter(item => {
			return item['RDV'] === filterObject.depart; 
		})
	}

	if (filterObject.distance_min) {
		all = all.filter(item => {
			return item.details.distance.value > filterObject.distance_min; 
		})
	}
	if (filterObject.distance_max) {
		all = all.filter(item => {
			return item.details.distance.value < filterObject.distance_max; 
		})
	}

	console.log(all); 

	let output = []; 
	if (type === 'id') {
		all.forEach(item => { output.push(item._id)})
	} else if (type === 'connect_id') {
		all.forEach(item => { output.push(item.connect_id)})
	}
	
	return output; 
}


function displayOnly(array_of_id) {
	// ne laisser afficher que les cartes qui sont dans le tableau fourni en param
	let allCards = document.querySelectorAll('.track__item'); 
	allCards.forEach(card => { card.classList.add('displaynone')}); 
	allCards.forEach(card => {
		if (array_of_id.indexOf(card.dataset.id*1) > -1) {
			card.classList.remove('displaynone'); 
		}
	})
}




function openDificultyInfo() {
	let style = `<style id="modale-content-style">

		#modale {
			position: fixed; 
			bottom: 0; 
			width: 100%; 
			background-color: #fff; 	
			box-shadow: 0 0 78px #2121218c; 
			padding: 1em; 
			padding-top: 2em;
			border-top: solid 8px #DA6C066e; 
			z-index:10; 
		}
		#modale button {
			float: right;
			border-radius: 120px;
			display: flex;
			width: 52px;
			height: 52px;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			border: none;
			position: relative;
			bottom: 62px;
			box-shadow: 1px 1px 6px #2121214f; 
		}

		#modale .content {
			max-width: 920px;
			margin: auto;
			width: 96%;
		}
		#modale .content p {
			margin-bottom: 1em;
		}

		#modale .content blockquote {
			margin-left: 1em;
			margin-bottom: 1em;
			border: solid 1px #ccc;
			border-left: solid 5px #ccc;
			border-radius: 2px;
			padding: 0.6em;
		}
	
	</style>`; 

	if (!document.querySelector('#modale-content-style')) { document.head.insertAdjacentHTML('beforeend', style)}

	let text = `<p>Le <strong>score de difficulté</strong> est une mesure arbitraire de la difficulté théorique d'un parcours. À distance équivalente, il permet d'avoir une idée de quel parcours sera le plus exigeant.</p>
	<p><em>Il n'est pas lié à la longueur du parcours mais aux côtes et ascensions qui le composent.</em></p>
	<p>Le calcul est basé sur la formule de difficulté d'une ascension utilisée par <a href='https://www.procyclingstats.com/info/profile-score-explained' target='_blank'>ProCyclingStats</a> pour sa propre classification des parcours de course. Un score de difficulté est calculé pour chaque partie montante du parcours selon la formule :<blockquote>[(pente/2)²] × [longueur en km]</blockquote>
	<p>La somme de ces scores donne le score du parcours.</p>`; 

	let template = `<div id="modale" >
		<button><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
		<div class="content">
			${text}
		</div>
	</div>`; 

	if (!document.querySelector('#modale')) {
		document.querySelector('body').insertAdjacentHTML('beforeend', template); 
		let modaleElt = document.querySelector('#modale'); 
		modaleElt.querySelector('button').addEventListener('click', event => {
			modaleElt.remove(); 
		})
	}
}


function displayNumberOfTrack(number) {
	document.querySelector('#tracks-counter').textContent = `—${number} parcours affichés`; 
}



function sortIDs(param) {
	let data = [...document.data]; 
	if (param === 'distance-') {
		data.sort((a,b) => {
			return b.details.distance.value - a.details.distance.value; 
		}); 
	} else if (param === 'distance+') {
		data.sort((a,b) => {
			return a.details.distance.value - b.details.distance.value; 
		}); 
	} else if (param === 'alpha+') {
		data.sort((a,b) => {
			if (a.details.name > b.details.name) { return 1; }
			if (a.details.name < b.details.name) { return -1; }
			return 0; 
		}); 
	} else if (param === 'alpha-') {
		data.sort((a,b) => {
			if (a.details.name > b.details.name) { return -1; }
			if (a.details.name < b.details.name) { return 1; }
			return 0; 
		}); 
	} else if (param === 'elevation-') {
		data.sort((a,b) => {
			return b.details.elevation.value - a.details.elevation.value; 
		}); 
	} else if (param === 'elevation+') {
		data.sort((a,b) => {
			return a.details.elevation.value - b.details.elevation.value; 
		}); 
	} else if (param === 'score-') {
		data.sort((a,b) => {
			return b.details.score.value - a.details.score.value; 
		}); 
	} else if (param === 'score+') {
		data.sort((a,b) => {
			return a.details.score.value - b.details.score.value; 
		}); 
	}

	let output = [];
	data.forEach(item => { output.push(item._id); })
	return output; 
	
}
function sortCards(array_of_id) {
	if (array_of_id.length === 0) { return }

	let container = document.querySelector('.tracks-block');
	// sort 1st item of the list : 
	container.insertAdjacentElement('afterbegin', container.querySelector(`[data-id="${array_of_id[0]}"]`)); 

	if (array_of_id.length === 1) { return }

	for (let i = 1; i<array_of_id.length; i++) {
		container.querySelector(`[data-id="${array_of_id[i-1]}"]`).insertAdjacentElement('afterend', container.querySelector(`[data-id="${array_of_id[i]}"]`))
	}
}


function toggleFilters() {
	document.querySelector('.filter-block').classList.toggle('closed'); 
}






/**
 * détecte automatiquement le path d'une URL :
 */
function getPathOfURL(url) {
    let typeOfParam = 'unkown'; 
    if (typeof url === 'string') { typeOfParam = 'String' }
    else if(url instanceof URL) { typeOfParam = 'URL' }
    else if(url instanceof Location) { typeOfParam = 'Location' }

    url = new URL(url); 
    let pathname = url.pathname; 

    if (pathname.substr(pathname.length-1, pathname.length) !== '/') {
        // le pathname ne termine par un nom de fichier ou une requete
        let index = pathname.lastIndexOf('/'); 
        pathname = pathname.slice(0, index+1); 
    }
    return pathname.slice(1,-1);
}
