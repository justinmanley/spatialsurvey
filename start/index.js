function initialize() {
	var mapCenter = new google.maps.LatLng(41.790113, -87.600732);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true,
			strokeColor: '#ffff4d'
		}
	});
	var surveyHelper = spatialsurvey(map, document, drawingManager);
	var mapHelper = mapcalc(map, document);

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
		data.setPath(polyline.getPath().getArray());
		drawingManager.setOptions({
			drawingMode: null
		});		
		mapHelper.rightClickButton(polyline);

		surveyHelper.showNextButton(data, 'add_time', 'start', function() {
			var startTime = document.getElementById('sidebar-start-time').value;
			var endTime = document.getElementById('sidebar-end-time').value;	
			if ( surveyHelper.isValidTime(startTime) && surveyHelper.isValidTime(endTime)) {
				data.setStartTime(startTime);
				data.setEndTime(endTime);
				return true;
			}
			else { 
				return false; 
			}
		}, function() {
			var instructionsSidebar = document.getElementById('instructions-content');
			var errorMessage = document.createElement('p');
			errorMessage.id = 'error-message';
			errorMessage.innerHTML = 'Please enter your start and end time.';
			instructionsSidebar.appendChild(errorMessage);	

			setTimeout(function() { errorMessage.style.backgroundColor = oldColor; }, 1500);
		});
	});

	var data = surveyHelper.personPath();

	var instructionsPrimary = [
		{ 
			content: '<h2>Your Daily Path</h2>'+
					'<h3>Draw the path that you took around campus yesterday.</h3>'+
					'<p>If you live in Hyde Park, start drawing when you left home.  Otherwise, start when you arrived on campus.</p>'+
					'<p>We would like to link the path to a time, so before you move on, make sure to enter the time your path starts and ends.</p>',
			buttonText: 'START'
		}
	];

	var instructionsSidebar = '<div id="instructions-content">'+
									'<h2>Instructions</h2>'+
									'<p>Draw the path that you took around campus yesterday.</p>'+								
									'<p>When did your path start?  When did it end?  Make sure to include the time of day (am/pm).</p>'+
								'</div><!-- #instructions-content -->'+
								'<p>'+
								'<form>'+
									'<div id="start-end-time-question">'+
										'<label for="start-time">Start Time</label>'+
										'<br />'+
										'<input name="start-time" id="sidebar-start-time"/>'+
									'</div>'+
									'<div id="start-end-time-question">'+
										'<label for="end-time">End Time</label>'+
										'<br />'+
										'<input name="end-time" id="sidebar-end-time"/>'+
									'</div>'+
								'</form>'+
								'</p>'+
								'<p>When you\'re done, click the button at the bottom of the page to advance to the next step.</p>';

	surveyHelper.instructions.init(drawingManager, { 
		content: instructionsPrimary, 
		sidebar: instructionsSidebar 
	});

}

google.maps.event.addDomListener(window, 'load', initialize);

		// ,
		// '<form>'+
		// 	'<div id="start-end-time-question">'+
		// 		'<label for="start-time">Start</label>'+
		// 		'<br />'+
		// 		'<input name="start-time" id="primary-start-time"/>'+
		// 	'</div>'+
		// 	'<div id="start-end-time-question">'+
		// 		'<label for="end-time">End</label>'+
		// 		'<br />'+
		// 		'<input name="end-time" id="primary-end-time"/>'+
		// 	'</div>'+
		// '</form>'