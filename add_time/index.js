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
	var data = spatialsurvey.personPath();
	data.display(map, function() {
		timestampMarkers = new Array();

		var start = data.getStartTime();
		var end = data.getEndTime();
		var pathLength = google.maps.geometry.spherical.computeLength(data.getPath());
		for (var i = start; i < end; i++) {
			// position = 
			var infowindow = spatialsurvey.addTimestampMarker(map, userPolyline, position);
			timestampMarkers.push(infowindow);
		}

		spatialsurvey.showInstructions(map, document);
		spatialsurvey.showNextButton(map, document, data, 'add_transit', function() {
			var times = spatialsurvey.getTimestamps(timestampMarkers);
			console.log(times);
			data.setTimestamps(times);
		});		

		google.maps.event.addListener(map, 'click', function(event) {
			userPolyline = data.getPolyline();
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, 0.0005)) {
				var position = mapcalc.closestPointOnPolyline(userPolyline, event.latLng, 0.000001);
				var infowindow = spatialsurvey.addTimestampMarker(map, userPolyline, position);
				timestampMarkers.push(infowindow);
			}
		});
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
