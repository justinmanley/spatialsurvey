<?php 
	session_start();
	$_SESSION['user-polyline-data'] = $_POST['user-polyline-data'];
	$page_name = $_POST['next-page-name']; 
	header('Location: ' . $page_name);
?>