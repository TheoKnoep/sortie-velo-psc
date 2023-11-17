<?php 
class CSVParser {
	public function __construct($csvContent) {
		$this->csv = $csvContent; 
	}

	public function csvToArray() {

		$tmp = array_map('str_getcsv', explode("\n", $this->csv));
		$output = []; 

		$head = $tmp[0]; 

		// overide heads : 
		$head = [
			"Distance", 
			"Denivele", 
			"Direction", 
			"RDV", 
			"Notes", 
			"Lien garmin connect"
		]; 
		$csv_lines = count($tmp); 

		for ($i = 1; $i < $csv_lines; $i++) {
			$item = []; 
			for ($j = 0; $j < count($head); $j++) {
				$item[$head[$j]] = $tmp[$i][$j];  
			}
			$output[] = $item; 
		}

		return $output; 
	}
}