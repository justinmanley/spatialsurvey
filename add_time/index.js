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
	var surveyHelper = spatialsurvey(map, document);
	var mapHelper = mapcalc(map, document);
	var data = surveyHelper.personPath();
	data.display(function() {
		timestampMarkers = new Array();

		var start = data.getStartTime();
		var end = data.getEndTime();
		var pathLength = google.maps.geometry.spherical.computeLength(data.getPath());
		for (var i = start; i < end; i++) {
			var infowindow = surveyHelper.addTimestampMarker(map, userPolyline, position);
			timestampMarkers.push(infowindow);
		}

		surveyHelper.showNextButton(map, document, data, 'save', function() {
			var times = surveyHelper.getTimestamps(timestampMarkers);
			console.log(times);
			data.setTimestamps(times);
		});

		google.maps.event.addListener(map, 'click', function(event) {
			var userPolyline = data.getPolyline();
			var tolerance = 0.05*Math.pow(1.1, -map.getZoom());
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, tolerance)) {
				var position = mapHelper.closestPointOnPolyline(userPolyline, event.latLng);
				var infowindow = surveyHelper.addTimestampMarker(userPolyline, position);
				timestampMarkers.push(infowindow);
			}
		});
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
