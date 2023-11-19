<?php 
class CSVParser {
	public function __construct($csvContent) {
		$this->csv = $csvContent; 
	}

	public function csvToArray() {

		$lines = explode("\n", $this->csv);

		$result = array();

		$head = str_getcsv($lines[0]); 

		$csv_lines = count($lines); 
	
		for ($i = 1; $i < $csv_lines; $i++) { 
			$pattern = '/"(.*?)"/';

			$lines[$i] = preg_replace_callback($pattern, function($matches) {
				return str_replace(',', '&#44;', $matches[0]); // Remplace les virgules par &#44;
			}, $lines[$i]);
			$data = str_getcsv($lines[$i], ',', '"');

			$result[] = array(
				'Distance' => $data[0],
				'Denivele' => $data[1],
				'Direction' => $data[2],
				'RDV' => $data[3],
				'Notes' => $data[4],
				'Lien garmin connect' => $data[5]
			);
		}


		return $result; 

		/**
		 * @deprecated :
		 */
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