<?php
class Autoload {
	public static function load($folder) {
		// echo $folder; 
		$list = glob($folder . '/*'); 
		foreach ($list as $fichier) {
			require $folder . '/' . basename($fichier); 
		}
	}
}