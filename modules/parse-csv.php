<?php 
class CSVParser {
	public function __construct($csvContent) {
		$this->csv = $csvContent; 
	}


	public function csvToArray($forcedHeaders = []) {
		$lines = explode("\n", $this->csv);
		$result = array();
		$head = str_getcsv($lines[0]); 

		$csv_lines = count($lines); 
	
		for ($i = 1; $i < $csv_lines; $i++) { 
			$data = str_getcsv($lines[$i], ',', '"');

			if ($forcedHeaders) {
				for ($j = 0; $j < count($forcedHeaders); $j++) {
					$result[$i-1][$forcedHeaders[$j]] = $data[$j]; 
				}
			} else {;
				for ($j = 0; $j < count($head); $j++) {
					$result[$i-1][$head[$j]] = $data[$j]; 
				}
			}
		}

		return $result; 
	}


	public function getHeaders() {
		$lines = explode("\n", $this->csv);
		return trim($lines[0]); 
	}


	/**
	 * ne marche pas avec 'lien garmin connect' à approfondir : 
	 * var_dump($array1[5]); ==> string(20) "Lien garmin connect
	 * "
	 * var_dump($array2[5]); ==> string(19) "Lien garmin connect"
	 * 
	 * un caractère spécial provient de la fin de la ligne du header du CSV d'origine
	 * a priori ce n'est pas \n 
	 */
	public function verifyHeaders($constraint) {
		$array1 = explode(',', $this->getHeaders()); 
		$array2 = explode(',', $constraint); 

		if (count($array1) === count($array2)) {
			$count = count($array1);
			for ($i = 0; $i < $count; $i++) {
				if (mb_strtolower($array1[$i], 'UTF-8') !== mb_strtolower($array2[$i], 'UTF-8')) {
					throw new Exception("Les éléments à l'indice $i ne correspondent pas : {$array1[$i]} !== {$array2[$i]}");
					return false; 
				}
			}
		} else {
			throw new Exception("Les tableaux n'ont pas la même taille.");
			return false; 
		}
	}
}