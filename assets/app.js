

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
		return `<div class="track__item">
			<div class="main-line">
				<div class="map-container" data-connect-id="${ data['connect_id'] }"></div>
				<div class="text-container">
					<h2 class="title"><span class="distance">${Math.round(data.details.distance.value)}km</span> <span class="name">${data.details.name}</span></h2>
					
					<p class="description">${data['Notes']}</p>
					<div class="meta-line">
						<div class="direction"><span class="bold">${ICONS.direction}&nbsp;Direction</span> : ${data['Direction']}</div>
						<div class="rdv"><span class="bold">${ICONS.start}&nbsp;Départ</span> : ${data['RDV']}</div>
						<div class="elevation"><span class="bold">${ICONS.elevation}&nbsp;Dénivelé</span> : ${data.details.elevation.value} m</div>
						<div class="score"><span class="bold">Difficulté</span> : ${data.details.score.value} <span class="more-info" onclick="openDificultyInfo()" style="cursor: pointer; position: relative; top: 3px;">${ICONS.infos(18)}</span></div>
					</div>
				</div>

			</div>
			<div class="secondary-line">
				<a class="button-link gpx-link" href="${location.origin + '/psc-tracks/tracks/' + data['connect_id'] + '.gpx'}">.GPX</a>
				<a class="button-link garmin-connect-link" href="${data['Lien garmin connect']}" target="_blank">Garmin Connect</a>
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
	
		document.querySelectorAll('.map-container').forEach(map => {
			displayMap(map, map.dataset.connectId, 120); 
		})
	}); 
}

function displayMap(target, connect_id, dimension) {
	let template = `<div class="track-view" style="position: relative; height: ${dimension+10}px;">
		<iframe src="http://localhost/psc-tracks/map/?track=${connect_id}" frameborder="0" width="${dimension}" height="${dimension}" scrolling="no" style="position: absolute; border-radius: 8px;"></iframe>
		<div class="mask" style="width: ${dimension}px; height: ${dimension}px; position: absolute; "></div>
	</div>`; 
	target.innerHTML = ''; 
	target.insertAdjacentHTML('beforeend', template); 
}

function openDificultyInfo() {
	alert('Le score de difficulté bla bla bla...')
}