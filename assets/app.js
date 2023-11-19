

const APP_CONTAINER = document.querySelector('.tracks-block'); 

let example = {
    "Distance": "70",
    "Denivele": "400",
    "Direction": "Est",
    "RDV": "Poly",
    "Notes": "70km S&M Aller Champigny retour Chennevièvre",
    "Lien garmin connect": "https://connect.garmin.com/modern/course/210494863",
    "connect_id": "210494863",
    "details": {
        "name": "Boucle 70km PSC",
        "distance": {
            "value": 79.438,
            "unit": "km"
        },
        "elevation": {
            "value": 370,
            "unit": "m"
        },
        "score": {
            "value": 9
        }
    }
}; 


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
				<div class="text-container">
					<h2 class="title"><span class="distance">${Math.round(data.details.distance.value)}km</span> <span class="name">${data.details.name}</span></h2>
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
				<a class="button-link gpx-link" href="${location.origin + '/sortie-velo-psc/tracks/' + data['connect_id'] + '.gpx'}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>&nbsp;.GPX</a>
				<a class="button-link garmin-connect-link" href="${data['Lien garmin connect']}" target="_blank"><span style="background-image: url('assets/images/ico-connect.png'); width: 16px; height: 16px;"></span>&nbsp;Garmin Connect</a>
			</div>
		</div>`; 
	}
}




window.addEventListener('DOMContentLoaded', initialLoad); 




fetch('synchronize.php')
.then(res => res.text()) 
.then(text => console.log(text)); 





function initialLoad() {
	fetch('data.json')
	.then(res => res.json())
	.then(json => {
		console.log(json); 
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
	}); 
}

function displayMap(target, connect_id, dimension) {
	let template = `<div class="track-view" style="position: relative; height: ${dimension+10}px;">
		<iframe src="${location.origin}/sortie-velo-psc/map/?track=${connect_id}" frameborder="0" width="${dimension}" height="${dimension}" scrolling="no" style="position: absolute; border-radius: 8px;"></iframe>
		<div class="mask" style="width: ${dimension}px; height: ${dimension}px; position: absolute; "></div>
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

		let arryOfIDsToDisplay = listOfIDsForFilter(filters); 
		displayOnly(arryOfIDsToDisplay); 
		displayNumberOfTrack(arryOfIDsToDisplay.length);  

	})
}


function listOfIDsForFilter(filterObject) {
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
	all.forEach(item => { output.push(item._id)})
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
			border: solid 1px gray;
			border-left: solid 5px gray;
			padding: 0.6em;
		}
	
	</style>`; 

	if (!document.querySelector('#modale-content-style')) { document.head.insertAdjacentHTML('beforeend', style)}

	let text = `<p>Le <strong>score de difficulté</strong> est une mesure arbitraire de la difficulté théorique d'un parcours. À distance équivalente, il permet d'avoir une idée de quel parcours sera le plus exigeant.</p>
	<p><em>Il n'est pas lié à la longueur du parcours mais aux côtes et ascensions qui le composent.</em></p>
	<p>Le calcul est basé sur la formule de difficulté d'une ascension utilisée par <a href='https://www.procyclingstats.com/info/profile-score-explained' target='_blank'>ProCyclingStats</a> pour sa propre classification des parcours de course. Un score de difficulté est calculé pour chaque partie montante du parcours selon la formule :<blockquote>[(pente/2)^2] * [longueur en km]</blockquote>
	<p>La somme de ces scores donne le score du parcours.</p>`; 

	let template = `<div id="modale" style="
		position: fixed; 
		bottom: 0; 
		width: 100%; 
		background-color: #fff; 	
		box-shadow: 0 0 78px #2121218c; 
		padding: 1em; 
	">
		<button style="
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
			bottom: 3em;
			box-shadow: 0 0 12px #2121218c; 
		">X</button>
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
	document.querySelector('#tracks-counter').textContent = `${number} parcours affichés`; 
}