function initialize() {
	var mapCenter = new google.maps.LatLng(41.790113, -87.600732);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	var drawingManager = new google.maps.drawing.DrawingManager(
		{
			drawingMode: google.maps.drawing.OverlayType.POLYLINE,
			drawingControl: true,
			drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_CENTER,
			drawingModes: [
				google.maps.drawing.OverlayType.POLYLINE
			]
		},
		polylineOptions: {
			editable: true,
			draggable: true
		},
	});
	drawingManager.setMap(map);

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
		data.setPath(polyline.getPath().getArray());
	});

	var data = spatialsurvey.personPath();

	spatialsurvey.showNextButton(map, document, data, 'add_time', function() {
		google.maps.event.trigger('polylinecomplete');	
		var startTime = document.getElementById('start-time').value;
		var endTime = document.getElementById('end-time').value;
		data.setStartTime(startTime);
		data.setEndTime(endTime);	
	});

	// event handler to close welcome screen
	var welcome_close = document.getElementsByClassName('close-box')[0];
	google.maps.event.addDomListener(welcome_close, 'click', function() {
		document.body.removeChild(document.getElementById('welcome'));
		spatialsurvey.showInstructions(map, document);	
	});		

}

google.maps.event.addDomListener(window, 'load', initialize);