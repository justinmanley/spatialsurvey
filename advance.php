<?php 
	session_start();
	if (isset($_POST['path-data'])) {
		$_SESSION['path-data'] = $_POST['path-data'];
		validateTimes();		
	}

	function validateTime($timeString) {
		$regex = '/^(\d|[1][0-2])(:([0-5]\d))?\s?(AM|PM)$/i';
		if ( preg_match($regex, $timeString) === 1) {
			$_SESSION['error-message'] = ''; // clear the error message 
			header('Location: ' . $_POST['next-page-name']);			
		}			
		else {
			$_SESSION['error-message'] = 'Please enter the time you left home and the time you returned home.';
			header('Location: ' . $_POST['current-page-name']);
		}
	}

	function validateTimes() {
		$data = json_decode($_POST['path-data']);
		validateTime($data->startTime);
		validateTime($data->endTime);
		if (isset($data->timestamps)) {
			foreach($data->timestamps as $timeString) {
				validateTime($timeString);
			}
		}
	}
?>