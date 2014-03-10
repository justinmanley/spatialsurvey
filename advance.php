<?php 
	session_start();
	if (isset($_POST['path-data'])) {
		$_SESSION['path-data'] = $_POST['path-data'];
		header('Location: ' . '../pages/' . $_POST['next-page-name']);			
	}

	function validateTime($timeString) {
		$regex = '/^(\d|[1][0-2])(:([0-5]\d))?\s?(AM|PM)$/i';
		if ( preg_match($regex, $timeString) === 1)
			header('Location: ' . $_POST['next-page-name']);				
		else
			header('Location: ' . $_POST['current-page-name']);
	}

	function validateTimes() {
		$data = json_decode($_POST['path-data']);
		validateTime($data->startTime);
		validateTime($data->endTime);
		if (isset($data->timestamps)) {
			foreach($data->timestamps as $timeString) {
				validateTime($timeString->time);
			}
		}
	}
?>