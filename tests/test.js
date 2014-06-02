var appName = 'test-app';
QUnit.begin(function() {
	var mapCenter = new google.maps.LatLng(41.78961025632396, -87.59967505931854);
	var map = new google.maps.Map(document.getElementById("qunit-fixture"), {
		center: mapCenter,
		zoom: 19,
		maxZoom: 20,
		minZoom: 18,
		zoomControl: { style: 'SMALL' },
		mapTypeId: google.maps.MapTypeId.HYBRID
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true,
			strokeColor: '#4387fd',
			strokeWeight: 4
		}
	});
	spatialsurvey.init({
		map: map, 
		drawingManager: drawingManager,
		appName: appName

	});	
});

module("spatialsurvey");
test("getResouceUrl()", function() {
	equal(spatialsurvey.getResourceUrl('hello.js'), '../../spatialsurvey/resources/hello.js');
});	

function inheritsFromUIComponent(obj, type) {
	equal(obj.hasOwnProperty('get'), true, type + " has getter.");
	equal(obj.hasOwnProperty('set'), true, type + " has setter.");
	deepEqual(obj.set('test', 'This is a test.'), obj, type + ".set() returns self.");
	deepEqual(obj.setDefaults({'test': 'This is a test.'}), obj, type + ".set() returns self.");
	equal(obj.setDefaults({ test: "This is a test." }).get("test"), "This is a test.", type + ".setDefaults(options).");
}

test("UIComponent()", function() {
	var component = new spatialsurvey.UIComponent();
	inheritsFromUIComponent(component, "UIComponent");
});

test("Button()", function() {
	var button = new spatialsurvey.Button({ 
		id: appName + '-button', 
		text: 'NEXT', 
		onClick: function() {}
	});
	inheritsFromUIComponent(button, "Button");
	button.show();
	equal(button.get('id'), appName + '-button', "Button.get(key) returns option indexed by key.");
});

test("ProgressBar()", function() {
	var progressBar = new spatialsurvey.ProgressBar({
		currentPage: 2,
		max: 4,
		description: 'Sample description'
	});
	inheritsFromUIComponent(progressBar, "ProgressBar");
	progressBar.show();
});

test("Sidebar()", function() {
	var sidebar = new spatialsurvey.Sidebar();
	inheritsFromUIComponent(sidebar, "Sidebar");
	sidebar.show();
});

test("Instructions()", function() {
	var instructions = new spatialsurvey.Instructions({

	});
	inheritsFromUIComponent(instructions, "Instructions");
	instructions.show();
});


test("Timestamp()", function() {
	var timestamp = new spatialsurvey.Timestamp();
	inheritsFromUIComponent(timestamp, "Timestamp");
	timestamp.show();
});

test("Tutorial()", function() {
	var tutorial = new spatialsurvey.Tutorial();
	equal(1,1);
});

module("mapHelper");
test("Line()", function() {
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

test("closestPointOnPolyline()", function() {
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

test("toGeoJSON()", function() {
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