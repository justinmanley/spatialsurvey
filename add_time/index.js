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

	// all user data is stored in this object
	var data = personPath();


	var backForm = document.createElement('form');
	backForm.id = 'previous-page-form';
	backForm.setAttribute('method', 'post');
	backForm.setAttribute('action', '../advance.php');
	backForm.innerHTML = '<input type="hidden" name="path-data-prev" id="path-data-prev"/>'+
							'<input type="hidden" name="previous-page-name" id="previous-page-name"/>'+
							'<input type="submit" id="previous-button" value="&#8592"/>';
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(backForm);

	var nextForm = document.createElement('form');
	nextForm.id = 'next-page-form';
	nextForm.setAttribute('method', 'post');
	nextForm.setAttribute('action', '../advance.php');
	nextForm.innerHTML = '<input type="hidden" name="next-page-name" id="next-page-name"/>'+
							'<input type="hidden" name="path-data" id="path-data"/>'+
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

	data.load();
	data.display(map);

	timestamps = new Array();

	google.maps.event.addListener(map, 'click', function(event) {
		userPolyline = data.getPolyline();
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
		var pathData = document.getElementById('path-data');
		var nextPageName = document.getElementById('next-page-name');
		nextPageName.setAttribute('value', 'add_transit');
		pathData.setAttribute('value', data.toString());		
		nextForm.submit();
	});
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
