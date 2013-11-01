// test.js

(function test() {
	var polylinePath = [
		new google.maps.LatLng(41.79110875472779, -87.60143458843231),
		new google.maps.LatLng(41.790672796877395, -87.60257720947266),
		new google.maps.LatLng(41.7899488603194, -87.60267376899719),
		new google.maps.LatLng(41.78965688359293, -87.60215878486633),
		new google.maps.LatLng(41.78968088173019, -87.60032951831818)
	];

	var segment = [
		new google.maps.LatLng(41.79110875472779, -87.60143458843231),
		new google.maps.LatLng(41.790672796877395, -87.60257720947266)
	];

	var polyline = new google.maps.Polyline({
		path: polylinePath,
		geodesic: true,
		strokeColor: '#FFFFFF',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	var testPoint1 = new google.maps.LatLng(41.789336907570885, -87.60064601898193);
	var testPoint2 = new google.maps.LatLng(41.79051281160146, -87.60072648525238);

	var testPoints = [testPoint1, testPoint2];

	function testClosestVertex(p, polyline) {
		if (!closestVertex(p, polyline))
			return false;
		else
			var v = closestVertex(p, polyline);
		console.log("closestVertex(p) = " + JSON.stringify(v));
		console.log(v);
		console.log("closestVertex(p) == p: " + JSON.stringify(p.equals(v.coord)));
		console.log(p);
		if (polyline.getPath().getArray().indexOf(v.coord) == -1) {
			console.log("v is not in polyline");
			return false;
		}
		else
			console.log("v is in polyline");
		console.log(polyline.getPath().getArray());
		return true;
	}

	function testClosestPerpendicularPoint(polyline, segment, p, tolerance) {
		var p = closestPerpendicularPoint(polyline, segment, p, tolerance);
		if (testClosestVertex(p, polyline)) {
			var segVertex1 = closestVertex(p, polyline).coord;
			var segVertex2 = polyline.getPath().getAt(closestVertex(p,polyline).index + 1);
			var segVertex3 = polyline.getPath().getAt(closestVertex(p,polyline).index - 1);
			if (typeof segVertex2 != 'undefined') {
				var seg = [segVertex1, segVertex2];
				var q = closestPerpendicularPoint(polyline, seg, p, tolerance);
				console.log("using segVertex2: closestPerpendicularPoint(p) = " + JSON.stringify(q));
				console.log(q);
			}
			else if (typeof segVertex3 != 'undefined') {
				var seg = [segVertex1, segVertex3];
				var q = closestPerpendicularPoint(polyline, seg, p, tolerance);
				console.log("using segVertex3: closestPerpendicularPoint(p) = " + JSON.stringify(q));
				console.log(q);
			}
			else
				console.log("Cannot locate adjacent point to generate segment.");
		}
		else {
			console.log("closestVertex(p) failed.");
		}

		console.log("closestPerpendicularPoint(p) == p: " + JSON.stringify(p.equals(q)));
	}

	function testClosestPointOnPolyline(polyline, point, tolerance) {
		var v = closestPointOnPolyline(polyline, point, tolerance);
		console.log("closestPointOnPolyline(p) = " + JSON.stringify(v));
		console.log(v);
		console.log("closestPointOnPolyline(p) == p: " + JSON.stringify(point.equals(v)));
	}

	testPoints.forEach(function(p) { 
		console.log("======== closestVertex =========");
		testClosestVertex(p, polyline); 

		console.log("======== closestPerpendicularPoint =========");
		testClosestPerpendicularPoint(polyline, segment, p, 0.001);

		console.log("======== closestPointOnPolyline =========");
		testClosestPointOnPolyline(polyline, p, 0.001);
	});

})();