<?php 
	session_start();
	$filename = 'output.kml';
	$data = json_decode($_SESSION['path-data']);
	// print_r($data->polyline);
	require_once('kml_template.php');
	// file_put_contents("kml_output/" . $filename, );
?>