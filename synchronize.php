<?php

require 'vendor/autoload.php'; 

use Theoknoep\GpxDifficultyScore\GpxDifficultyScore; 
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');


require 'autoload.php'; 
Autoload::load('modules'); 





// fetch source data
$importer = new DataImporter( $_SERVER['DATA_SOURCE'] ); 
$csv = $importer->importCSV(); 


// check if any new content : 
	// verif if exists : 
	$directory = 'cache/';
	$file = 'datahash.txt';
	if (!is_dir($directory)) {
		mkdir($directory, 0755, true); // Crée le répertoire s'il n'existe pas
	}
	$file_path = $directory . $file;
	if (!file_exists($file_path)) { fopen($file_path, 'a'); }

$inital_hash = file_get_contents('cache/datahash.txt'); 
$new_data_hash = md5($csv); 

if ($inital_hash === $new_data_hash) {
	// echo "Les données n'ont pas changées"; 
	exit; 
} else {
	echo "data_changed"; 
}

// check if csv is right format : 
$csvParser = new CSVParser($csv);

try {
	$constraintOnHeaders = "Distance,Dénivelé ,Direction,RDV,Notes,Lien garmin connect";
	$csvParser->verifyHeaders($constraintOnHeaders); 
} catch (Exception $err) {
	echo "invalid_imported_csv_header"; 
	exit; 
}



// 2. Enrichissement des données. 
$forcedHeaders = ['Distance', 'Denivele', 'Direction', 'RDV', 'Notes', 'Lien garmin connect']; 
$ARRAY_OF_DATA = $csvParser->csvToArray($forcedHeaders);

$id_settler = 0; 
foreach($ARRAY_OF_DATA as &$item) {
	$fromGarmin = new GPXfromGarminConnect($item['Lien garmin connect']); 
	$connect_id = $fromGarmin->getID(); 
	$fromGarmin->getGPX(); 

	// $more_details_about_track = GPXParser::parse("tracks/$connect_id.gpx"); 
	$more_details_about_track = GpxDifficultyScore::parse("tracks/$connect_id.gpx"); 

	$item['Direction'] = ucfirst(trim($item['Direction']));
	$item['RDV'] = ucfirst(trim($item['RDV']));

	$item['connect_id'] = $connect_id; 
	$item['details'] = $more_details_about_track; 
	$item['_id'] = $id_settler; 
	$id_settler++; 
}
unset($item);



// 3. enregistrement des données : 
$data_json = json_encode($ARRAY_OF_DATA, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); 
file_put_contents('data.json', $data_json); 

// update cachehash : 
file_put_contents('cache/datahash.txt', $new_data_hash); 




