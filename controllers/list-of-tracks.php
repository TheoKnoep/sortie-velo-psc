<?php
$tracks = glob('../tracks/*'); 
foreach($tracks as &$track) {
    $track = basename($track); 
}
header('Content-Type: application/json'); 
echo json_encode($tracks); 