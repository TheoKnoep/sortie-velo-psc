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
		$csv = htmlentities(file_get_contents($this->url . 'export?format=csv')); 
		// $csv = preg_match('/</', '&amp;'); // bref, remplacer les balises par leur équivalent &amp; 
		return $csv; 
	}

	

}