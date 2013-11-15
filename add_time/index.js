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
	data.display(map, function() {
		showInstructions(map, document);
		showNextButton(map, document, data, 'add_transit');				

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
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
