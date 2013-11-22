// test.js
function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	test(map);
}

google.maps.event.addDomListener(window, 'load', initialize);

// ===========================================================================
// Tests
// ===========================================================================

function test(map) {

}

// 		Displays all markers and polylines on the map, then calls 
// 		the function given by "func" 
// 		argTypes are: POLYLINE, MARKER, LATLNG, MAP, SEGMENT
// ---------------------------------------------------------------------------
function simulate(func, argTypes, map) 
// ---------------------------------------------------------------------------
{
	var argumentVector = [];
	for (var i = 0; i < args.length; i++) 
	{
		var arg = args[i];
		switch(arg) {
			case 'POLYLINE':
				argumentVector.push(arrayToPolyline(testData().path1));
				arrayToPolyline(testData().path1);
				break;
			case 'LATLNG':
				argumentVector.push(testData().points[0]);
				pointToMarker(testData().points[0]);
				break;
			case 'MAP':
				argumentVector.push(map);
				break;
		}
	}
	func.apply(null, args);
}

function testData() {
	return {
		points: [
			// new google.maps.LatLng(41.79089677559289, -87.59971261024475),
			new google.maps.LatLng(41.79082078290214, -87.60201662778854),
			new google.maps.LatLng(41.790460816300815, -87.602279484272),
			new google.maps.LatLng(41.79073079144132, -87.60308682918549),
			new google.maps.LatLng(41.78986686698941, -87.6007828116417)
		],
		path1: [
			new google.maps.LatLng(41.79110875472779, -87.60143458843231),
			new google.maps.LatLng(41.790672796877395, -87.60257720947266),
			new google.maps.LatLng(41.7899488603194, -87.60267376899719),
			new google.maps.LatLng(41.78965688359293, -87.60215878486633),
			new google.maps.LatLng(41.78968088173019, -87.60032951831818)
		],
		segment1: [
			new google.maps.LatLng(41.79110875472779, -87.60143458843231),
			new google.maps.LatLng(41.790672796877395, -87.60257720947266)
		]
	};
}

function arrayToPolyline(xs, map) {
	return new google.maps.Polyline({
		path: xs,
		map: map
	});
}

function pointToMarker(x, map) {
	return new google.maps.Marker({
		position: x,
		map: map
	});
}

function printTestResult() {
	//
}



