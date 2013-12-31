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
	var surveyHelper = spatialsurvey(map);
	var mapHelper = mapcalc(map);

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

	var instructions = [
		'<h3>Thank you for participating in this survey!</h3>'+
		'<div id="welcome-img"><img src="../images/instruction1.gif" /></div><!-- #welcome-img -->'+
		'<p>To start, draw the path that you took around campus today.</p>',
		'<p>If you make a mistake, don\'t worry; you\'ll have a chance to edit the path you\'ve drawn before you proceed to the next step.</p>'+
		'<p>When you\'re done, double-click on the last point to save your path, then click the button at the bottom of the page to advance to the next step.</p>'
	];

	surveyHelper.instructions.init(map, document, drawingManager, { content: instructions 	});

}

google.maps.event.addDomListener(window, 'load', initialize);