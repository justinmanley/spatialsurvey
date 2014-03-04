<?php 
	session_start();
	if (isset($_SESSION['path-data']))
		echo json_encode($_SESSION['path-data']);
	else
		echo '{}';
		// throw new Exception('No path data');
?>