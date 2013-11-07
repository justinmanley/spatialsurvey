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


	var backForm = document.createElement('form');
	backForm.id = 'previous-page-form';
	backForm.setAttribute('method', 'post');
	backForm.setAttribute('action', '../advance.php');
	backForm.innerHTML = '<input type="hidden" name="user-polyline-data" id="user-polyline-data-prev"/>'+
							'<input type="hidden" name="previous-page-name" id="next-page-name"/>'+
							'<input type="submit" id="previous-button" value="&#8592"/>';
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(backForm);

	var nextForm = document.createElement('form');
	nextForm.id = 'next-page-form';
	nextForm.setAttribute('method', 'post');
	nextForm.setAttribute('action', '../advance.php');
	nextForm.innerHTML = '<input type="hidden" name="user-polyline-data" id="user-polyline-data"/>'+
							'<input type="hidden" name="next-page-name" id="next-page-name"/>'+
							'<input type="hidden" name="userpath" id="userpath"/>'+
							'<input type="submit" id="next-button" value="NEXT"/>';
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
		polyline = eval(JSON.parse(this.responseText));
		userPolylinePath = polyline[0].map(createLatLng);
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
	};
	conn3.send();

	console.log(userPolyline.getPath());
	timestamps = new Array();

	google.maps.event.addListener(map, 'click', function(event) {
		if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, 0.0005)) {
			var position = closestPointOnPolyline(userPolyline, event.latLng, 0.000001);
			var formContent = '<div class="timestamp">'+
									'<form class="timestamp-form">'+
										'<label for="time">Time</label>'+
										'<br />'+
										'<input type="text" name="time"/>'+
										'<input type="hidden" name="position"' + JSON.stringify(position) + '/>'
									'<form>'+
								'</div>';
			// var formContent = '<div>8:00pm</div>';
			var infowindow = new InfoBox({
				content: formContent,
				position: position,
				boxStyle: {
					background: '#ffffff',
					opacity: 0.75,
					padding: '5px'
				},
				// closeBoxURL: ""
			});

			timestamps.push(infowindow);

			google.maps.event.addListener(infowindow, 'closeclick', function(event) {
				var marker = new google.maps.Marker({
					position: infowindow.getPosition(),
					map: map
				});
				google.maps.event.addListener(marker, 'click', function(event) {
					marker.setMap(null);
					infowindow.open(map);
				});
			});

			infowindow.open(map);
			console.log(closestPointOnPolyline(userPolyline, event.latLng, 0.00001, map));
		}
	});

	google.maps.event.addDomListener(nextForm, 'click', function() {
		var nextForm = document.getElementById('next-page-form');
		var userPolylineValue = document.getElementById('user-polyline-data');
		var nextPageName = document.getElementById('next-page-name');
		userPolylineValue.setAttribute('value', JSON.stringify([userPolyline.getPath().getArray()]));
		nextPageName.setAttribute('value', 'add_transit');		
		nextForm.submit();
	});
}

function createLatLng(coord) {
	return new google.maps.LatLng(coord.nb, coord.ob);
}

function getContainer(matchClass) {
	inputs = new Array(); 
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
                > -1) {
        	inputs.push(elems[i]);
        }
    }
    return inputs;
}

google.maps.event.addDomListener(window, 'load', initialize);
