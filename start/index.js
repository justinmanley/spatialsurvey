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
		mapHelper.rightClickButton(map, document, polyline);

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
			content: '<h2>Instructions</h2>'+
					'<h3>Draw the path that you took around campus yesterday.</h3>'+
					'<div class="instructions-main-img"><img src="../images/instructions1.gif" /></div><!-- .instructions-main-img -->',
			buttonText: 'NEXT'
		},
		{
			content: '<h3>When you\'re done, double-click on the last point to save your path, then click the button at the bottom of the page to advance to the next step.</h3>'+
					'<div class="instructions-main-img"><img src="../images/instructions2.gif" /></div><!-- .instructions-main-img -->',
			buttonText: 'GOT IT'

		},
		{
			content: '<h3>If you make a mistake, don\'t worry! You\'ll have a chance to edit the path you\'ve drawn.  You can edit the path once it\'s completed by dragging the midpoints of segments or by deleting vertices.</h3>',
			buttonText: 'START'
		}
	];

	var instructionsSidebar = '<div id="instructions-content">'+
									'<h2>Instructions</h2>'+
									'<p>Use the polyline tool at the top of the page to draw the path that you took around campus yesterday.  Please be as specific as possible!</p>'+
									'<p>When you\'re done, click the button at the bottom of the page to advance to the next step.</p>'+
								'</div><!-- #instructions-content -->'+
								'<form>'+
									'<div id="start-end-time-question">'+
										'<label for="start-time">Start</label>'+
										'<br />'+
										'<input name="start-time" id="sidebar-start-time"/>'+
									'</div>'+
									'<div id="start-end-time-question">'+
										'<label for="end-time">End</label>'+
										'<br />'+
										'<input name="end-time" id="sidebar-end-time"/>'+
									'</div>'+
								'</form>';

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