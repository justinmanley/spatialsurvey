test("getResouceUrl()", function() {
	equal(getResourceUrl('hello.js'), '../../spatialsurvey/resources/hello.js');
});

test("timestringToInteger()", function() {
	equal(timestringToInteger("10am"), 10);
});

test("PathData.load() empty", function() {
	sessionStorage.clear();
	var pathData = new spatialsurvey.PathData();
	pathData.load();
	equal(pathData.toString(), "{}", "pathData.load() serializes to the empty string.");
	deepEqual(pathData.getPolylineCoordinates(), [], "pathData.load() is the empty array [].");
});

test("mapHelper.Line()", function() {
	equal(typeof mapHelper.Line, 'function', "mapHelper.Line() is defined.");

	var testLine = new mapHelper.Line({
		point1: new google.maps.LatLng(0,0),
		point2: new google.maps.LatLng(1,0)
	});
	equal(testLine.getSlope(), 0, "getSlope() is 0 for horizontal segment.");


	var perpendicular = new mapHelper.Line({
		point1: new google.maps.LatLng(1,1),
		point2: new google.maps.LatLng(0,0)
	});
	// equal(perpendicular.getPerpendicularThroughPoint(new google.maps.LatLng(0,0)).getSlope(), -1, "getPerpendicularThroughPoint() is -1 for line with slope 1.");
});

test("mapHelper.closestPointOnPolyline()", function() {
	equal(typeof mapHelper.closestPointOnPolyline, 'function', "mapHelper.closestPointOnPolyline() is defined.");

	var A = new google.maps.LatLng(41.7858769102, -87.6007640362);
	var B = new google.maps.LatLng(41.7858542832, -87.6011073589);

	var testPolyline = new google.maps.Polyline({
		path: [ A, B ]
	});
	var testPoint = A;
	equal(mapHelper.closestPointOnPolyline(testPolyline, testPoint), testPoint, "For endpoint, closestPointOnPolyline returns self.");


	var testPolylineLength = google.maps.geometry.spherical.computeDistanceBetween(A, B);
	var testPolylineHeading = google.maps.geometry.spherical.computeHeading(A, B);
	var midPoint = google.maps.geometry.spherical.computeOffset(A, testPolylineLength/2, testPolylineHeading);

	equal(mapHelper.closestPointOnPolyline(testPolyline, midPoint).lat().toFixed(8), midPoint.lat().toFixed(8), "For midpoint, closestPointOnPolyline returns lat of self.");
	equal(mapHelper.closestPointOnPolyline(testPolyline, midPoint).lng().toFixed(8), midPoint.lng().toFixed(8), "For midpoint, closestPointOnPolyline returns lng of self.");
});

test("mapHelper.toGeoJSON()", function() {
	equal(typeof mapHelper.toGeoJSON, 'function', "mapHelper.toGeoJSON() is defined.");
	var testPoint1 = new google.maps.LatLng(0,0);
	var testPoint2 = new google.maps.LatLng(0,1);

	deepEqual(mapHelper.toGeoJSON(testPoint1), { "type": "Point", "coordinates": [0,0] }, "The point (0,0) is converted correctly to a geoJSON Point.");
	deepEqual(mapHelper.toGeoJSON(testPoint2), { "type": "Point", "coordinates": [1,0] }, "geoJSON Point coordinates have the format [longitude, latitude].")

	var testPolyline = new google.maps.Polyline({
		path: [
		new google.maps.LatLng(41.79646264332723, -87.60611236095428),
		new google.maps.LatLng(41.79647961077208, -87.6044574379921),
	]});

	deepEqual(mapHelper.toGeoJSON(testPolyline), { "type": "LineString", "coordinates": [
		[-87.60611236095428, 41.79646264332723],
		[-87.6044574379921, 41.79647961077208]
	]}, "Simple polyline conversion with thirteen decimal place latitude and longitude.");

});