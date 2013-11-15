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

	var startEndTimeForm = document.createElement('form');
	startEndTimeForm.id = 'start-end-time';
	startEndTimeForm.setAttribute('method', 'post');
	var startTime = document.createElement('input');
	startTime.type = 'textbox';
	startTime.name = 'start-time';
	var endTime = document.createElement('input');
	endTime.type = 'textbox';
	endTime.name = 'end-time';
	startEndTimeForm.appendChild(endTime);
	startEndTimeForm.appendChild(startTime);

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
		data.setPath(polyline.getPath().getArray());
	});

	var data = personPath();

	showInstructions(map, document);
	showNextButton(map, document, data, 'add_time');



}

google.maps.event.addDomListener(window, 'load', initialize);