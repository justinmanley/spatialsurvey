<?php 
	session_start();
	$filename = 'output.kml';
	file_put_contents("kml_output/" . $filename, $_SESSION['kml_string']);
?>