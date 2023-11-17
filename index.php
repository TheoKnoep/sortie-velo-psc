<?php

echo '<pre>'; 

require 'synchronize.php'; 


?>

<script>
	fetch('data.json')
		.then(res => res.json())
		.then(json => {
			console.log(json); 
			console.log(json[0]['Lien garmin connect']); 
		}); 
</script>