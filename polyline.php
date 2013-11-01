<?php 
	session_start();
	$userPolyline = $_SESSION['user-polyline-data'];
	echo json_encode($userPolyline);
?>