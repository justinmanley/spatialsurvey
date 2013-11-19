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
function timeAndPlace(data)
// ---------------------------------------------------------------
//		data = 
// 		{
//			time     : number from 0 - 23
// 			position : google.maps.LatLng object 
// 		}
{
	var that = {};

	var getTime = function() { return data.time; };
	that.getTime = getTime;

	var getPosition = function() { return data.position; };
	that.getPosition = getPosition; 

	return that;
}

// ----------------------------------------------------------------
function TransitType() 
// ----------------------------------------------------------------
{
	//
}

// ----------------------------------------------------------------
function personPath(data) 
// ----------------------------------------------------------------
/*		
	data = 
		{
			polyline 	   : Array of LatLng coordinates
			timestamps     : Array of TimeAt objects
			start-time	   : timeAndPlace objects
			end-time	   : timeAndPlace object
			transit-type   : 
			day			   : Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday 
	
			next-page-name : NOT USED in personPath
		}                                         
*/
{
	var data = data || {};
	var that = {};

	// verbose should be true only in a development environment
	var verbose = true;
	var polyline;
	var dataStringProperties = [];

	var debug = function(object, description) {
		if (verbose) {
			if (typeof description !== 'undefined')
				console.log(description);			
			console.log(object);			
		}
	}

	var setAttr = function(property, value) { data[property] = value; }
	var getAttr = function(property) { return data[property]; };

	// create getters, setters, and add property to the toString method
	var addProperty = function(property) {
		that['set' + property.capitalize()] = function(value) { setAttr(property, value); };
		that['get' + property.capitalize()] = function() { return getAttr(property); };

		dataStringProperties.push(property);
	}

	// takes an array of LatLng coordinates: i.e. input should be the result of polyline.getPath().getArray()
	var setPath = function(path) { data.polyline = path };
	that.setPath = setPath;

	// returns an array of LatLng coordinates
	var getPath = function() { return data.polyline || new Array(); };
	that.getPath = getPath;

	addProperty('startTime');
	addProperty('endTime');
	addProperty('timestamps');

	var getPolyline = function() {
		debug(getPath(), "getPath()");
		var polyline = new google.maps.Polyline({
			path: getPath(),
			strokeColor: '#000000',
			strokeWeight: 2,
			clickable: false			
		});
		return polyline;
	}
	that.getPolyline = getPolyline;

	var getTimes = function() { return data.timestamps || new Array(); };
	that.getTimes = getTimes;

	var toKML = function() {
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

		points = getPath().getArray();
		for (i = 0; i < points.length; i++) {
			kml += JSON.stringify(points[i].lat()) + ',' + JSON.stringify(points[i].lng()) + '\n';
		}

		kml +=			'</coordinates>'+
					'</LineString>'+
				'</Placemark>'+
			'</Document>'

		return kml;
	};
	that.toKML = toKML;

	var toString = function() {
		var stringable = new Object();		
		stringable.polyline = data.polyline.map(function(p) { return { lat: p.lat(), lng: p.lng() }; });
		for (i = 0; i < dataStringProperties.length; i++) {
			var name = dataStringProperties[i];
			if (data.hasOwnProperty(name)) { stringable[name] = data[name]; };	
		}
		return JSON.stringify(stringable); 
	};
	that.toString = toString;

	var display = function(map, callback) {
		load(function(){
			getPolyline().setMap(map);
			var startMarker = new google.maps.Marker({
				position: getPath()[0],
				map: map,
				icon: '../marker'
			});
			var endMarker = new google.maps.Marker({
				position: getPath().last(),
				map: map,
				icon: '../marker'
			});
		}, callback);	
	};
	that.display = display;

	// load data from previous screens
	var load = function(internalCallback, userCallback) {
		conn = new XMLHttpRequest();
		conn.overrideMimeType('application/json');
		conn.open('GET', '../polyline.php', true);
		conn.onreadystatechange = function() {
			if (this.readyState !== 4 ) return; 
			if (this.status !== 200 ) return; 
			debug(this.responseText);
			data = eval("(" + JSON.parse(this.responseText) + ")");
			setPath(data.polyline.map(createLatLng));
			debug(toString(), "toString()");
			internalCallback();
			userCallback();
		};
		conn.send();
	}

	return that;
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

function createLatLng(coord) {
	return new google.maps.LatLng(coord.lat, coord.lng);
}

function getContainer(doc, matchClass) {
	inputs = new Array(); 
    var elems = doc.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
                > -1) {
        	inputs.push(elems[i]);
        }
    }
    return inputs;
}

/* Add elements to the page */

function showInstructions(map, doc) {
	var instructions = doc.createElement('div');
	instructions.id = 'instructions';
	conn2 = new XMLHttpRequest();
	conn2.open('GET', 'instructions.php', true);
	conn2.onreadystatechange = function() {
		if (this.readyState !== 4 ) return; 
		if (this.status !== 200 ) return; 
		instructions.innerHTML = this.responseText;
	};
	conn2.send();
	map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(instructions);
}

function showButton(map, doc, data, destination, addToData, type) {
	var nextForm = doc.createElement('form');
	nextForm.id = type + '-form';
	nextForm.setAttribute('method', 'post');
	nextForm.setAttribute('action', '../advance.php');
	nextForm.innerHTML = '<input type="hidden" name="' + type + '-name" id="' + type + '-name" value="' + destination + '"/>'+
							'<input type="hidden" name="path-data" id="' + type + '-path-data"/>'+
							'<input type="submit" id="' + type + '-button" value="NEXT"/>';
	map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextForm);	

	google.maps.event.addDomListener(nextForm, 'click', function() {
		var pathData = doc.getElementById(type + '-path-data');
		if (typeof addToData !== 'undefined') { addToData(); };
		pathData.setAttribute('value', data.toString());
		nextForm.submit();
	});			
}

function showNextButton(map, doc, data, destination, addToData) {
	showButton(map, doc, data, destination, addToData, 'next-page');
}

function showPreviousButton(map, doc, data, destination, addToData) {
	showButton(map, doc, data, destination, addToData, 'previous-page');
}

function showTimestampInfoWindow(position) {
	var info = document.createElement('div');
	info.setAttribute('class', 'timestamp');
	info.innerHTML = '<form class="timestamp-form" onclick="false">'+
			'<label for="time">Time</label>'+
			'<br />'+
			'<input type="text" name="time" class="timestamp"/>'+
			'<input type="hidden" name="position"' + JSON.stringify(position) + '/>'
		'</form>'
	return info;
}

function showPlaceholderInfoWindow(position, time) {
	var placeholder = document.createElement('div');
	placeholder.innerHTML = '<div class="timestamp-label" style="font-size: 14pt;">'+time+'</div>'+
		'<form class="timestamp-form">'+
			'<input type="hidden" name="position"' + JSON.stringify(position) + '/>'
		'</form>';
	return placeholder;
}

function getTimestamps(xs) {
	var timestamps = [];
	for(var i = 0; i < xs.length; i++) {
		var time = xs[i].getContent().childNodes[0][0].value;
		timestamps.push(time);
	}
	return timestamps;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}