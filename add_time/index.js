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
		timestamps = new Array();

		showInstructions(map, document);
		showNextButton(map, document, data, 'add_transit', function() {
			var times = getTimestamps(timestamps);
			data.setTimestamps(times);
		});		

		google.maps.event.addListener(map, 'click', function(event) {
			userPolyline = data.getPolyline();
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, 0.0005)) {
				var position = closestPointOnPolyline(userPolyline, event.latLng, 0.000001);
				var infowindow = new InfoBox({
					content: showTimestampInfoWindow(position),
					position: position,
					boxStyle: {
						background: '#ffffff',
						opacity: 0.75,
						padding: '5px'
					}
				});

				timestamps.push(infowindow);

				var label = infowindow.getContent().childNodes[0].childNodes[0];
				google.maps.event.addDomListener(label, 'click', function(event) {
					infowindow.setMap(null);
					// this code might not be very robust
					var time = infowindow.getContent().childNodes[0][0].value;
					var placeholder = new InfoBox({
						content: showPlaceholderInfoWindow(position, time),
						position: position,
						boxStyle: {
							background: 'rgba(0,0,0,0)',
							opacity: 0.75,
							padding: '5px'
						},
						closeBoxURL: ""
					});
					google.maps.event.addDomListener(placeholder.getContent(), 'click', function(event) {
						placeholder.setMap(null);
						infowindow.open(map);
					});
					var marker = new google.maps.Marker({
						icon: '../marker.png',
						position: position,
						map: map
					});
					google.maps.event.addListener(marker, 'click', function(event) {
						placeholder.setMap(null);
						marker.setMap(null);
						infowindow.open(map);
					});					
					placeholder.open(map);
				});

				infowindow.open(map);
				// console.log(closestPointOnPolyline(userPolyline, event.latLng, 0.00001, map));
			}
		});
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
