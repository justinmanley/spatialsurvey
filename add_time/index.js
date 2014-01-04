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
	var surveyHelper = spatialsurvey(map);
	var mapHelper = mapcalc(map);
	var data = surveyHelper.personPath();
	data.display(map, function() {
		timestampMarkers = new Array();

		var start = data.getStartTime();
		var end = data.getEndTime();
		var pathLength = google.maps.geometry.spherical.computeLength(data.getPath());
		for (var i = start; i < end; i++) {
			var infowindow = surveyHelper.addTimestampMarker(map, userPolyline, position);
			timestampMarkers.push(infowindow);
		}

		// surveyHelper.showInstructions(map, document);
		surveyHelper.showNextButton(map, document, data, 'add_transit', function() {
			var times = surveyHelper.getTimestamps(timestampMarkers);
			console.log(times);
			data.setTimestamps(times);
		});

		google.maps.event.addListener(map, 'click', function(event) {
			var userPolyline = data.getPolyline();
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, 0.0005)) {
				var position = mapHelper.closestPointOnPolyline(userPolyline, event.latLng);
				var infowindow = surveyHelper.addTimestampMarker(userPolyline, position);
				timestampMarkers.push(infowindow);
			}
		});

		mapHelper.distributeTimeStamps(data.getPolyline(), 10);
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
