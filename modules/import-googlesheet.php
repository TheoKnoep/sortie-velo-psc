<?php 

class GoogleSheetImporter {
	function __construct($url) {
		$this->url = $url; 
	}

	public function importCSV() {
		// ATTENTION il s'agit quand même d'aspirer des données que n'importe qui peut modifier 
		// gris risque d'injection

		/**
		 * TO DO : 
		 * - vérifier que l'URL est bien drive.google.com
		 * - sanitizer le CSV obtenu (comment ?)
		 */ 
		$csv = file_get_contents($this->url . 'export?format=csv'); 
		
		// basic sanitize : 
		$csv = preg_replace('/</', '&lt;', $csv); // bref, remplacer les balises par leur équivalents
		$csv = preg_replace('/>/', '&gt;', $csv); // bref, remplacer les balises par leur équivalents

		$encoding = mb_detect_encoding($csv, mb_detect_order(), true);
		// echo 'Encodage détecté : ' . $encoding;

		return $csv; 
	}

	

}