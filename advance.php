<?php 
	session_start();
	if (isset($_POST['path-data']))
		$_SESSION['path-data'] = $_POST['path-data'];
	if (!isset($_POST['next-page-name'])) 
		throw new Exception("Error: Destination page not specified.");
	header('Location: ' . $_POST['next-page-name']);
?>