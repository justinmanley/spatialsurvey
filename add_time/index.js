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
		timestampMarkers = new Array();

		showInstructions(map, document);
		showNextButton(map, document, data, 'add_transit', function() {
			var times = getTimestamps(timestamps);
			data.setTimestamps(times);
		});		

		google.maps.event.addListener(map, 'click', function(event) {
			userPolyline = data.getPolyline();
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, 0.0005)) {
				var position = closestPointOnPolyline(userPolyline, event.latLng, 0.000001);
				var infowindow = addTimestampMarker(map, position);
				timestampMarkers.push(infowindow);
			}
		});
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
