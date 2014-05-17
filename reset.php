<?php 
	session_start();
	$_SESSION['path-reset'] = 'true';
	print_r($_SESSION);
	// header('Location: ../pages/start/');
?>