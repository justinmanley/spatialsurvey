function initialize() {
    var mapOptions = {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
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

	var data = personPath();

	var nextForm = document.createElement('form');
	nextForm.id = 'next-page-form';
	nextForm.setAttribute('method', 'post');
	nextForm.setAttribute('action', '../advance.php');
	conn = new XMLHttpRequest();
	conn.open('GET', '../submit.php', true);
	conn.onreadystatechange = function() {
		if (this.readyState !== 4 ) return; 
		if (this.status !== 200 ) return; 
		nextForm.innerHTML = this.responseText;
	};
	conn.send();
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextForm);	

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

	var instructions = document.createElement('div');
	instructions.id = 'instructions';
	conn = new XMLHttpRequest();
	conn.open('GET', 'instructions.php', true);
	conn.onreadystatechange = function() {
		if (this.readyState !== 4 ) return; 
		if (this.status !== 200 ) return; 
		instructions.innerHTML = this.responseText;
	};
	conn.send();
	instructions.appendChild(startEndTimeForm);
	map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(instructions);

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
		data.setPath(polyline.getPath().getArray()); 
	});

	google.maps.event.addDomListener(nextForm, 'click', function() {
		var nextForm = document.getElementById('next-page-form');
		var pathData = document.getElementById('path-data');
		var nextPageName = document.getElementById('next-page-name');
		nextPageName.setAttribute('value', 'add_time');
		pathData.setAttribute('value', data.toString());
		nextForm.submit();
	});

}

google.maps.event.addDomListener(window, 'load', initialize);