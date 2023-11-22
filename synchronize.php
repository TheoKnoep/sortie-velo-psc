<?php

require 'autoload.php'; 
Autoload::load('modules'); 

(new DotEnv(__DIR__ . '/.env'))->load(); 


// fetch source data
$importer = new DataImporter( $_SERVER['SHEET_SOURCE'] ); 
$csv = $importer->importCSV(); 


// check if any new content : 
$inital_hash = file_get_contents('cache/datahash.txt'); 
$new_data_hash = md5($csv); 

if ($inital_hash === $new_data_hash) {
	echo "Les données n'ont pas changées"; 
	exit; 
} else {
	echo "data_changed"; 
	file_put_contents('cache/datahash.txt', $new_data_hash); // update cached data hash
}



// 2. Enrichissement des données. 
$ARRAY_OF_DATA = (new CSVParser($csv))->csvToArray();


$id_settler = 0; 
foreach($ARRAY_OF_DATA as &$item) {
	$fromGarmin = new GPXfromGarminConnect($item['Lien garmin connect']); 
	$connect_id = $fromGarmin->getID(); 
	$fromGarmin->getGPX(); 

	$more_details_about_track = GPXParser::parse("tracks/$connect_id.gpx"); 

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





