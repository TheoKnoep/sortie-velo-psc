<?php 

class GoogleSheetImporter {
	function __construct($url) {
		$this->url = $url; 
	}

	public function importCSV() {
		$csv = file_get_contents($this->url . 'export?format=csv'); 
		return $csv; 
	}
}