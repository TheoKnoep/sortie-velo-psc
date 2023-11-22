<?php 

class DataImporter {
	function __construct($url) {
		$this->url = $url; 
	}

	public function importCSV() {
		$csv = file_get_contents($this->url . 'export?format=csv'); 
		
		// basic sanitize : 
		$csv = preg_replace('/</', '&lt;', $csv); 
		$csv = preg_replace('/>/', '&gt;', $csv); 

		$encoding = mb_detect_encoding($csv, mb_detect_order(), true);
		// echo 'Encodage détecté : ' . $encoding;

		return $csv; 
	}


}