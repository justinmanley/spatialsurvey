<?php 
	session_start();
	$_SESSION['path-data'] = '{}';
	header('Location: ../pages/start/');
?>