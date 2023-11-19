<?php

echo '<pre>'; 

$line = '60,300,Est,Villette ou poly,"Petit tour sans s\'éloigner, 100% urbain, pas roulant",https://connect.garmin.com/modern/course/163957087'; 

$csv = str_getcsv($line, ',', '"'); 
print_r($csv); 