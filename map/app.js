/**
 * Documentation Leaflet : 
 * https://leafletjs.com/reference.htm 
 */



document.polylines = []; 
document.active_polyline = null; 


const TRACK_COLOR = "#ed143db5"; 


let mapOptions = {
    zoom: 12
}; 

let map = L.map('the-map', mapOptions); 


// On peut choisir parmi de nombreux fonds de carte avec : http://leaflet-extras.github.io/leaflet-providers/preview/ 
let provider = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"; 

L.tileLayer(provider, {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);










async function initMap(array_of_path) {
    // Initialiser l'affichage de la carte : 


    let promisses = []; 
    // display track :
    array_of_path.forEach(path_from_url => {
        promisses.push(displayPointsOnMap(path_from_url, {color: TRACK_COLOR})); 
    })

    return Promise.all(promisses); 




    /* **********************************************************
    * PARSE XML CONTENT : 
    */

    async function displayPointsOnMap(pathfile, options = null) {
        if (!pathfile) {
            throw new Error('GPX track is not defined'); 
        }
        let data = []; 
        let input = pathfile.split('.')[pathfile.split('.').length-1]; 

        //select Color: 
        if (options && options.color) { color = options.color }

        // Get data
        if (input === 'gpx') {
            data = await parseGPX(pathfile);
        } else if(input === 'tcx') {
            data = await parseTCX(pathfile); 
        }

        // map.panTo([data[0].lat, data[0].lon]); 

        // paint line :
        let latlngs = []; 
        data.forEach(coord => {
            latlngs.push([coord.lat, coord.lon]); 
        })
        let polyline = L.polyline(latlngs, { color: color }); 
        polyline.addTo(map); 

        polyline.feature = {
            properties: {
                'name': pathfile
            }
        }


        // centrer la vue sur l'intégralité de la trace : 
        // let bounds = polyline.getBounds(); 
        // map.fitBounds(bounds); 

        document.polylines.push(polyline); 

        return polyline; 
    }









    async function parseGPX(pathfile) {
        let parser = new DOMParser(); 
        let course_points = []; 

        return fetch(pathfile)
            .then(res => res.text())
            .then(text => {
                xmlDoc = parser.parseFromString(text, "text/xml"); 
                let collection = xmlDoc.querySelectorAll('trkpt'); 
                collection.forEach(point => {
                    if (!point.querySelector('time')) { throw new Error("Pas d'information d'horaire pour cet itinéraire")}; 
                    course_points.push({
                        time: point.querySelector('time').textContent, 
                        lat: point.getAttribute('lat'), 
                        lon: point.getAttribute('lon')
                    }); 
                }); 
                return course_points; 
            }); 
    }


    function getPositionForTimeStamp(timestamp, collection_of_points) {
        let out = ''; 
        for (let i = 0; i < collection_of_points.length; i++) {
            if (new Date(collection_of_points[i].time).getTime() - new Date(timestamp).getTime() > 0) {
                out = collection_of_points[i]; 
                break; 
            }
        }
        return out;
    }


    function displayMarker(lat, lon) {

    }



    async function parseTCX(path) {
        let parser = new DOMParser(); 
        let course_points = []; 
        return fetch(path)
            .then(res => res.text())
            .then(text => {
                xmlDoc = parser.parseFromString(text, "text/xml"); 
                let collection = xmlDoc.querySelectorAll('Trackpoint'); 
                collection.forEach(point => {
                    course_points.push({
                        time: point.querySelector('Time').textContent, 
                        lat: point.querySelector('Position LatitudeDegrees').textContent, 
                        lon: point.querySelector('Position LongitudeDegrees').textContent
                    }); 
                }); 
                return course_points; 
            }); 
    }

}
