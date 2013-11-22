function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
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

	spatialsurvey.showInstructions(map, document);
	spatialsurvey.showNextButton(map, document, data, 'add_time', function() {
		var startTime = document.getElementById('start-time').value;
		var endTime = document.getElementById('end-time').value;
		data.setStartTime(startTime);
		data.setEndTime(endTime);
	});

}

google.maps.event.addDomListener(window, 'load', initialize);