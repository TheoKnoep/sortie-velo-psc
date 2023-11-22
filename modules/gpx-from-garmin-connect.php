<?php

class GPXfromGarminConnect {
	const FOLDER = __DIR__ . '/../tracks'; 

	/**
	 * @param string URL du parcours sur Garmin Connect
	 */
	function __construct($url) {
		$this->url = $url; 
		return $this; 
	}

	public function test() {
		echo $this::FOLDER . '<br/>';
		$existing_tracks_files = glob(GPXfromGarminConnect::FOLDER . '/*');
		
		$existing = []; 
		foreach($existing_tracks_files as $file) {
			$existing[] = basename($file); 
		}
		print_r($existing);  
	}

	public function getGPX($force_new_fetch = false) {
		$_course_id = $this->getID(); 

		$existing_tracks_files = glob(GPXfromGarminConnect::FOLDER . '/*'); 
		$existing = []; 
		foreach($existing_tracks_files as $file) {
			$existing[] = basename($file); 
		}

		if ($force_new_fetch === true || !in_array($_course_id . '.gpx', $existing)) {
			// on télécharge le GPX sur le serveur :
			$gpx = file_get_contents('https://connect.garmin.com/modern/proxy/course-service/course/gpx/' . $_course_id); 
			$this->saveToServer($_course_id, $gpx); 
			return; 
		} 	
	}

	public function getID() {
		$parts = parse_url($this->url); 
		if ($parts['host'] !== 'connect.garmin.com') {
			throw new Exception('URL is not Garmin Connect : ' . $this->url); 
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