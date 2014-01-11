function initialize() {
	var mapCenter = new google.maps.LatLng(41.790113, -87.600732);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true
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

		surveyHelper.showNextButton(map, document, data, 'add_time', function() {
			var startTime = document.getElementById('start-time').value;
			var endTime = document.getElementById('end-time').value;
			data.setStartTime(startTime);
			data.setEndTime(endTime);	
		});
	});

	var data = surveyHelper.personPath();

	var instructionsPrimary = [
		'<h3>Thank you for participating in this survey!</h3>'+
		'<div id="welcome-img"><img src="../images/instruction1.gif" /></div><!-- #welcome-img -->'+
		'<p>To start, draw the path that you took around campus today.</p>',
		'<p>If you make a mistake, don\'t worry; you\'ll have a chance to edit the path you\'ve drawn before you proceed to the next step.</p>'+
		'<p>When you\'re done, double-click on the last point to save your path, then click the button at the bottom of the page to advance to the next step.</p>'
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
										'<input name="start-time" id="start-time"/>'+
									'</div>'+
									'<div id="start-end-time-question">'+
										'<label for="end-time">End</label>'+
										'<br />'+
										'<input name="end-time" id="end-time"/>'+
									'</div>'+
								'</form>';
	surveyHelper.instructions.init(drawingManager, { 
		content: instructionsPrimary, 
		sidebar: instructionsSidebar 
	});

}

google.maps.event.addDomListener(window, 'load', initialize);