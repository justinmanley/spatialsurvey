var latToLngScalingFactor = function() {
	var unitDistanceLat = google.maps.geometry.spherical.computeDistanceBetween(
		new google.maps.LatLng(41.690113, -87.600732),
		new google.maps.LatLng(41.890113, -87.600732)
	);

	var unitDistanceLng = google.maps.geometry.spherical.computeDistanceBetween(
		new google.maps.LatLng(41.790113, -87.500732),
		new google.maps.LatLng(41.790113, -87.700732)
	);
	return unitDistanceLat/unitDistanceLng;
} ();

// Constructor for a Segment object.  Takes an array containing two LatLng points.
// -------------------------------------------
function Segment(segment) 
// -------------------------------------------
{
	this.getVertices = function() {
		return segment;
	}
	this.generateSlope = function() {
		var dx = (latToLngScalingFactor^2)*(segment[0].lat() - segment[1].lat());
		var dy = segment[0].lng() - segment[1].lng();
		return dy/dx;
	};
	this.generatePerpendicularSlope = function() {
		return -1/this.generateSlope();
	};
	this.toLine = function() {
		return new Line(segment[0], this.generateSlope());
	};
}

// Constructor for a Line object.  Takes a LatLng point and a slope (a number).
// ------------------------------------------------------------
function Line(point, slope) 
// ------------------------------------------------------------
{
	this.getSlope = function () { return slope; };
	this.getPoint = function () { return point; };
	this.getPerpendicularSlope = function () { return -1/slope; };
	this.calculateIntersection = function(that) {
		// Assuming that the equations of the two lines are:
		//     this: y = y_0 + m_0(x - x_0)
		//     that: y = y_1 + m_1(x - x_1)

		var k = latToLngScalingFactor;
		var y_0 = point.lat();
		var y_1 = that.getPoint().lat();
		var m_0 = slope;
		var m_1 = that.getSlope();
		var x_0 = point.lng();
		var x_1 = that.getPoint().lng();

		var x_intersect = ((y_0 - y_1) - (m_0*x_0 - m_1*x_1))/(m_1 - m_0);

		return new google.maps.LatLng(
			y_0 + m_0*(x_intersect - x_0), x_intersect

		);
	};
}

// ---------------------------------------------------------------
function TimeAt(time, point)
// ---------------------------------------------------------------
{
	this.getTime = function() { return time; };
	this.getPoint = function() { return point; };
}

// ----------------------------------------------------------------
function TransitType() 
// ----------------------------------------------------------------
{
	//
}

// ----------------------------------------------------------------
function PersonPath() 
// ----------------------------------------------------------------
{
	if ( !(this instanceof arguments.callee) ) 
	   throw new Error("Constructor called as a function");

	// an array of latLng points
	var path;
	this.setPath = function(p) { path = p.getPath(); };
	this.getPath = function() { return ( path === undefined ) ? new Array() : path; };

	// an array of TimeAt objects
	var times;
	this.setTimes = function(t) { times = t; };
	this.getTimes = function() { return ( times === undefined ) ? new Array() : times; };

	this.toKML = function() {
		var kml = '<?xml version="1.0" encoding="UTF-8"?>'+
			'xmlns="http://www.opengis.net/kml/2.2"'+
			'<Document>'+
				'<name>FS Survey Response</name>'+
					'<description>FS Survey Response</description>'+
				'<Placemark>'+
					'<name>Path</name>'+
					'<description>none</description>'+
					'<LineString>'+
						'<altitudeMode>relative</altitudeMode>'+
						'<coordinates>'

		points = path.getArray();
		for (i = 0; i < points.length; i++) {
			kml += JSON.stringify(points[i].lat()) + ',' + JSON.stringify(points[i].lng()) + '\n';
		}

		kml +=			'</coordinates>'+
					'</LineString>'+
				'</Placemark>'+
			'</Document>'

		return kml;
	}
}

// ------------------------------------------------------------
function closestPointOnPolyline(polyline, point, t, map) 
// ------------------------------------------------------------
{
	var criticalPoints = new Array();
	var v = closestVertex(point, polyline);
	criticalPoints.push(v.coord);
	if (v.index > 0) {
		var segment1 = new Segment([polyline.getPath().getAt(v.index -1), v.coord]);
		criticalPoints.push(closestPerpendicularPoint(polyline, segment1, point, t, map));
	}
	if (v.index < polyline.getPath().getArray().length - 1) {
		var segment2 = new Segment([v.coord, polyline.getPath().getAt(v.index + 1)]);
		criticalPoints.push(closestPerpendicularPoint(polyline, segment2, point, t, map));
	}

	var critical = criticalPoints.map(function(p) { return { coord:p, point: point }; }).sort(comparePoints);
	for (p = 0; p < critical.length; p++) {
		if (google.maps.geometry.poly.isLocationOnEdge(critical[p].coord, polyline, t))
			return critical[p].coord;
	}
	return -1;
}

// ------------------------------------------------------------------------
function getIterationsNumber(segment, point, dx, distanceUpperBound)
// ------------------------------------------------------------------------
{
	var m = segment.generatePerpendicularSlope();
	var unitDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat() + dx, point.lng() + latToLngScalingFactor*m*dx)
	);
	return distanceUpperBound/unitDistance;
}

function closestPerpendicularPoint(polyline, segment, point, dx, map) {
	var segmentVerticesByDistance = segment.getVertices().map(function(p) { return {coord: p, point: point}; }).sort(comparePoints);
	var distanceUpperBound = google.maps.geometry.spherical.computeDistanceBetween(segmentVerticesByDistance[0].coord, point);


	var n = getIterationsNumber(segment, point, dx, distanceUpperBound);

	var line = new Line(point, segment.generatePerpendicularSlope());
	var m = line.getSlope();

	// var p = line.calculateIntersection(segment.toLine());
	// console.log("intersection at " + JSON.stringify(p));
	// placeMarker(p, map);
	// return p;


	for (i = 0; i < n; i++) {
		var testPoint = new google.maps.LatLng(point.lat() + i*dx, point.lng() + m*i*dx);
		// placeMarker(testPoint, map);
		if (google.maps.geometry.poly.isLocationOnEdge(testPoint, polyline, dx))
			return testPoint;
	}
	for (i = 0; i > -n; i--) {
		var testPoint = new google.maps.LatLng(point.lat() + i*dx, point.lng() + m*i*dx);
		// placeMarker(testPoint, map);
		if (google.maps.geometry.poly.isLocationOnEdge(testPoint, polyline, dx))
			return testPoint;
	}
	return point;
}

// takes a LatLng point and an array of LatLng points
function closestVertex(point, polyline) {
	orderedCoordArray = new Array();
	for(i = 0; i < polyline.getPath().getArray().length; i++) {
		a = {coord: polyline.getPath().getAt(i) , index:i, point:point};
		orderedCoordArray.push(a);
	}
	orderedCoordArray.sort(comparePoints);
	return orderedCoordArray[0];
}

function comparePoints(a, b) {
	if (google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord) < google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord)) 
		return -1;
	if (google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord) < google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord))
		return 1;
	else
		return 0;
}

function placeMarker(point, map) {
	var marker = new google.maps.Marker({
		position: point,
		map: map
	});
}
