<?php 
	session_start();
	print_r($_POST);
	$_SESSION['user-polyline-data'] = $_POST['user-polyline-data'];
	$page_name = $_POST['next-page-name']; 
	header('Location: ' . $page_name);
?>