<?php
require 'autoload.php'; 
Autoload::load('modules'); 
(new DotEnv(__DIR__ . '/.env'))->load(); 
// --

echo '<pre>'; 

echo $_ENV['DATA_SOURCE'] . '<br/>';
echo $_ENV['SUB_PATH'] . '<br/>'; 