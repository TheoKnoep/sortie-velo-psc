<?php 


class GPXParser {
	/**
	 * @param string @gpx_file Path to GPX file
	 */
	public static function parse($gpx_path) {
		$return = []; 

		$gpx = file_get_contents($gpx_path); 

		$name = GPXParser::get_name($gpx); 
		$return['name'] = $name; 

		$array_of_points = GPXParser::parseGPXintoArrayOfPoints($gpx); 

		$distance = GPXParser::calculate_distance($array_of_points); 
		$return['distance'] = [
			"value" => (float)$distance, 
			"unit" => "km"
		]; 

		$denivele = GPXParser::calculate_elevation($array_of_points); 
		$return['elevation'] = [
			"value" => $denivele, 
			"unit" => "m"
		]; 

		// $departements = GPXParser::getTraversedDepartements($array_of_points); // ne fonctionne pas très bien, à revoir
		$cotes = GPXParser::identifyAscensions($array_of_points); 
		$total_score = GPXParser::calculate_score($cotes); 
		$return['score'] = [
			'value' => $total_score
		]; 


		return $return; 
	}


	private static function xml_to_array($xml_string) {
		// xml parser : 
		$xml = simplexml_load_string($xml_string, "SimpleXMLElement", LIBXML_NOCDATA); 
		// Depuis un fichier on devrait pouvoir utiliser `simplexml_load_file()` 
		$json = json_encode($xml);
		$array = json_decode($json,TRUE);
		return $array; 
	}



	private static function get_name($xml_string) {
		$array = GPXParser::xml_to_array($xml_string); 
		return $array['trk']['name']; 
	}



	/**
	 * Convertit une string XML en array de format Point : 
	 * Point => [
	 * 	"lat" => number,
	 * 	"lon" => number,
	 * 	"ele" => number
	 * ]
	 */
	private static function parseGPXintoArrayOfPoints($xml_string) {
		$array = GPXParser::xml_to_array($xml_string); 
		$collection_of_points = $array['trk']['trkseg']['trkpt']; 
		$output = []; 
		foreach($collection_of_points as $point) {
			$output[] = [
				"lat" => $point['@attributes']['lat'],
				"lon" => $point['@attributes']['lon'],
				"ele" => $point['ele']
			];
		}
		return $output; 
	}





	/**
	 * Calcule la distance en km entre deux coordonnées GPX
	 */
	private static function haversine($lat1, $lon1, $lat2, $lon2) {
		$lat1 = deg2rad($lat1);
		$lon1 = deg2rad($lon1);
		$lat2 = deg2rad($lat2);
		$lon2 = deg2rad($lon2);

		$dlat = $lat2 - $lat1;
		$dlon = $lon2 - $lon1;

		$a = sin($dlat/2)**2 + cos($lat1) * cos($lat2) * sin($dlon/2)**2;
		$c = 2 * atan2(sqrt($a), sqrt(1-$a));
		$R = 6371;  // Rayon moyen de la Terre en kilomètres

		$distance = $R * $c;
		return $distance;
	}


	/**
	 * Calcule la distance totale en km d'une collection de points GPS
	 * 
	 * @param coordonnates[] $array_of_coord Une collection de points au format [lat, lon]
	 */
	public static function calculate_distance($array_of_coord) {
		$total = 0; 
		$number_of_points = count($array_of_coord); 

		for ($i = 0; $i < $number_of_points-1; $i++) {
			$lat1 = $array_of_coord[$i]['lat'];
			$lon1 = $array_of_coord[$i]['lon'];
			$lat2 = $array_of_coord[$i+1]['lat'];
			$lon2 = $array_of_coord[$i+1]['lon'];

			$total += GPXParser::haversine($lat1, $lon1, $lat2, $lon2);
		}

		return number_format($total, 3); 
	}



	/**
	 * Calcule le dénivelé positif en m d'une collection d'altitudes
	 */
	public static function calculate_elevation($array_of_points) {
		$total = 0; 
		$number_of_points = count($array_of_points); 

		for ($i = 1; $i < $number_of_points; $i++) {
			$a = (int)$array_of_points[$i]['ele']; 
			$b = (int)$array_of_points[$i-1]['ele']; 
			if ($a > $b) {
				$total += $a - $b; 
			}
		}
		return $total; 
	}


	/**
	 * Permet de récupérer une liste des numéros de départements traversés par la trace
	 * Problématique de géocodage inversé
	 */
	public static function identifyDepartmentForCoord($lat, $lon) {
		$result = file_get_contents("https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/reverse?lat=$lat&lon=$lon&limit=1"); 
		$array = json_decode($result, true); 

		if (isset($array['features'][0])) {
			$postcode = $array['features'][0]['properties']['postcode']; 
			return floor($postcode/1000); 
		} else {
			return 'undefined'; 
		}

		
		
	}


	public static function getTraversedDepartements($array_of_points) {
		// get department of midpoint : ...TO DO
		$nb = count($array_of_points);
		// $midpoint_index = floor($nb/2); 
		
		$list_depts = []; 
		for ($i = 100; $i < $nb; $i = $i + 200) {
			$list_depts[] = GPXParser::identifyDepartmentForCoord($array_of_points[$i]['lat'], $array_of_points[$i]['lon']); 
		}
		return $list_depts; 
	}



	/**
	 * Découpe le GPX en segments d'ascensions uniquement 
	 */
	private static function identifyAscensions($array_of_points) {

		$dist_threshold = 0.200; // ne garder que les côtes qui font plus de 200 m; 

		$number_of_points = count($array_of_points); 
		$list_of_cotes = array(array()); 
		$cote_counter = 0; 
		$is_descending = false; 

		

		// lissage des points avec moyennes mobiles : 
		$moyennes_mobiles = []; 
		for ($i = 2; $i < $number_of_points-2; $i ++) {
			$moyennes_mobiles[$i] = GPXParser::calcul_moyenne($array_of_points[$i-2]['ele'], $array_of_points[$i-1]['ele'], $array_of_points[$i]['ele'], $array_of_points[$i+1]['ele'], $array_of_points[$i+2]['ele']); 
		}

		// print_r($moyennes_mobiles); 

		for ($i = 3; $i < count($moyennes_mobiles); $i++) {
			// echo $moyennes_mobiles[$i] . '<br/>';
			if ($moyennes_mobiles[$i]> $moyennes_mobiles[$i-1]) {
				$is_descending = false; 
				$list_of_cotes[$cote_counter][] = $array_of_points[$i]; 
			} else {
				if (!$is_descending) {
					$cote_counter++; 
				}
				$is_descending = true; 
			}
		}


		// print_r($list_of_cotes); 

		$output = []; 
		
		for ($i = 0; $i < count($list_of_cotes); $i++) {
			$dist = GPXParser::calculate_distance($list_of_cotes[$i]) * 1000; 
			$elevation = GPXParser::calculate_elevation($list_of_cotes[$i]); 
			
			if ($dist > $dist_threshold*1000) {
				$pente = ($elevation / ($dist) ) * 100; 
				$score = GPXParser::getProfileScore($dist/1000, $pente); 
				// echo "La $i e cote fait $dist m et D+ de $elevation m / Pente moyenne de $pente % /  Score ::: $score <br/>"; 
				if ($score > 1) {
						$output[] = [
						"distance" => $dist, 
						"elevation" => $elevation, 
						"steepness" => $pente, 
						"score" => $score
					]; 
				}
			}
		}

		// print_r($output); 
		return $output; 
	}


	/**
	 * Profile score is based on PCS formula : 
	 * https://www.procyclingstats.com/info/profile-score-explained 
	 * ([steepness/2] ^ 2 * (length in km)
	 */
	private static function getProfileScore($dist_in_km, $pente) {
		return (($pente/2)*($pente/2)) * $dist_in_km; 
	}


	/**
	 * Calculate score of track by summing the score of all ascensions :
	 */
	private static function calculate_score($array_of_ascensions) {
		$scores = array_column($array_of_ascensions, 'score'); 
		$total = 0; 
		foreach ($scores as $score) {
			$total += $score; 
		}
		return floor($total); 
	}





	private static function calcul_moyenne($nombre1, $nombre2, $nombre3, $nb4, $nb5) {
		return ($nombre1 + $nombre2 + $nombre3 + $nb4 + $nb5) / 5;
	}
}

