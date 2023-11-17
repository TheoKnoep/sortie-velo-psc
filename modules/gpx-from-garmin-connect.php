<?php

class GPXfromGarminConnect {
	const FOLDER = 'psc-tracks/tracks'; 
	/**
	 * @param string URL du parcours sur Garmin Connect
	 */
	function __construct($url) {
		$this->url = $url; 
		return $this; 
	}

	public function getGPX() {
		$_course_id = $this->getID(); 
		$gpx = file_get_contents('https://connect.garmin.com/modern/proxy/course-service/course/gpx/' . $_course_id); 

		$existing_tracks_files = glob($_SERVER['DOCUMENT_ROOT'] . '/'. GPXfromGarminConnect::FOLDER . '/*'); 

		$existing = []; 
		foreach($existing_tracks_files as $file) {
			$existing[] = basename($file); 
		}

		if (in_array($_course_id . '.gpx', $existing)) {
			// GPX déjà présent sur le serveur
		} else {
			$this->saveToServer($_course_id, $gpx); 
		}
	}

	private function getID() {
		$parts = parse_url($this->url); 
		if ($parts['host'] !== 'connect.garmin.com') {
			throw new Exception('URL is not Garmin Connect'); 
		}
		$_id = explode('/modern/course/', $parts['path'])[1];
		return $_id; 
	}

	private function saveToServer($_course_id, $gpx_content) {
		$file_to_path = $_SERVER['DOCUMENT_ROOT'] . '/'. GPXfromGarminConnect::FOLDER . '/' . $_course_id . '.gpx';
		$content = $gpx_content; 
		file_put_contents($file_to_path, $content); 
	}
}