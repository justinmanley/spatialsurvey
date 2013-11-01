if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var nextForm = document.createElement('form');
	nextForm.id = 'next-page-form';
	nextForm.setAttribute('method', 'post');
	nextForm.setAttribute('action', '../advance.php');
	conn1 = new XMLHttpRequest();
	conn1.open('GET', '../submit.php', true);
	conn1.onreadystatechange = function() {
		if (this.readyState !== 4 ) return; 
		if (this.status !== 200 ) return; 
		nextForm.innerHTML = this.responseText;
	};
	conn1.send();
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextForm);

	var instructions = document.createElement('div');
	instructions.id = 'instructions';
	conn2 = new XMLHttpRequest();
	conn2.open('GET', 'instructions.php', true);
	conn2.onreadystatechange = function() {
		if (this.readyState !== 4 ) return; 
		if (this.status !== 200 ) return; 
		instructions.innerHTML = this.responseText;
	};
	conn2.send();
	map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(instructions);

	var userPolyline = new google.maps.Polyline({
		strokeColor: '#000000',
		strokeWeight: 2,
		clickable: false
	});

	conn3 = new XMLHttpRequest();
	conn3.overrideMimeType('application/json');
	conn3.open('GET', '../polyline.php', true);
	conn3.onreadystatechange = function() {
		if (this.readyState !== 4 ) return; 
		if (this.status !== 200 ) return; 
		polylineCoords = eval(JSON.parse(this.responseText));
		userPolylinePath = polylineCoords[0].map(createLatLng);
		userPolyline.setPath(userPolylinePath);
		var startMarker = new google.maps.Marker({
			position: userPolylinePath[0],
			map: map
		});
		var endMarker = new google.maps.Marker({
			position: userPolylinePath.last(),
			map: map
		});
		userPolyline.setMap(map);
		console.log(userPolyline.getPath());
		
	};
	conn3.send();

	function addTimestampToLatLng(event) {
		if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, 0.0005)) {
			var formContent = '<div class="timestamp">'+
									'<form>'+
										'<label for="time">Time</label>'+
										'<br />'+
										'<input type="text" name="time"/>'+
									'<form>'+
								'</div>'
			var infowindow = new google.maps.InfoWindow({
				content: formContent,
				position: closestPointOnPolyline(userPolyline, event.latLng, 0.000001)
			});
			infowindow.open(map);
			console.log(closestPointOnPolyline(userPolyline, event.latLng, 0.00001, map));
		}
	}

	google.maps.event.addListener(map, 'click', addTimestampToLatLng);
}

function createLatLng(coord) {
	return new google.maps.LatLng(coord.lb, coord.mb);
}

google.maps.event.addDomListener(window, 'load', initialize);
