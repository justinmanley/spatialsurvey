var spatialsurvey = function(map, doc) {

	var map = map;

	// ---------------------------------------------------------------
	var timeAndPlace = function(data)
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
	var TransitType = function() 
	// ----------------------------------------------------------------
	{
		//
	}

	// ----------------------------------------------------------------
	var personPath = function(data) 
	// ----------------------------------------------------------------
	/*		
		data = 
			{
				path 	 	   : Array of LatLng coordinates
				timestamps     : Array of TimeAt objects
				start-time	   : timeAndPlace objects
				end-time	   : timeAndPlace object
				transit-type   : 
				day			   : Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday 
		
				next-page-name : NOT USED in personPath
			}                                         
	*/
	{
		var doc = doc;
		var data = data || {};
		var that = {};

		// verbose should be true only in a development environment
		var verbose = true;
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
		var setPath = function(path) { data.path = path };
		that.setPath = setPath;

		// returns an array of LatLng coordinates
		var getPath = function() { return data.path || new Array(); };
		that.getPath = getPath;

		addProperty('startTime');
		addProperty('endTime');
		addProperty('timestamps');

		var getPolyline = function() {
			if (typeof data.polyline === 'undefined') {
				var polyline = new google.maps.Polyline({
					path: getPath(),
					strokeColor: '#000000',
					strokeWeight: 2,
					clickable: false
				});
				data.polyline = polyline;
			}
			return data.polyline;
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
			stringable.path = data.path.map(function(p) { return { lat: p.lat(), lng: p.lng() }; });
			for (i = 0; i < dataStringProperties.length; i++) {
				var name = dataStringProperties[i];
				if (data.hasOwnProperty(name)) { stringable[name] = data[name]; };	
			}
			return JSON.stringify(stringable); 
		};
		that.toString = toString;

		var display = function(callback) {
			load(function(){
				getPolyline().setMap(map);
				console.log(that);
				mapcalc(map, doc).distributeTimeStamps(getPolyline(), that.getStartTime(), that.getEndTime());
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
				setPath(data.path.map(createLatLng));
				debug(toString(), "toString()");
				internalCallback();
				userCallback();
			};
			conn.send();
		}

		return that;
	}

	var createLatLng = function(coord) {
		return new google.maps.LatLng(coord.lat, coord.lng);
	}

	var getContainer = function(doc, matchClass) {
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

// -------------------------------------------------------------------------------------
	var showButton = function(data, destination, type, currentPageName, validate) 
// -------------------------------------------------------------------------------------
	{
		var nextForm = doc.createElement('form');
		nextForm.id = type + '-form';
		nextForm.setAttribute('method', 'post');
		nextForm.setAttribute('action', '../advance.php');
		nextForm.innerHTML = '<input type="hidden" name="' + type + '-name" id="' + type + '-name" value="' + destination + '"/>'+
								'<input type="hidden" name="current-page-name" id="current-page-name" value="'+currentPageName+'"/>'+
								'<input type="hidden" name="path-data" id="' + type + '-path-data"/>'+
								'<button type="button" id="' + type + '-button">NEXT</button>';
		map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextForm);	

		google.maps.event.addDomListenerOnce(nextForm, 'click', function() {
			if ( !validate() ) {
				var instructionsSidebar = doc.getElementById('instructions-content');
				var errorMessage = doc.createElement('p');
				errorMessage.id = 'error-message';
				errorMessage.innerHTML = 'Please enter your start and end time.';
				instructionsSidebar.appendChild(errorMessage);	

				setTimeout(function() { errorMessage.style.backgroundColor = oldColor; }, 1500)							
			}
		});

		google.maps.event.addDomListener(nextForm, 'click', function() {
			if ( validate() ) { 
				var pathData = doc.getElementById(type + '-path-data');
				pathData.setAttribute('value', data.toString());
				nextForm.submit(); 
			} 
			else {
				var startTimeForm = doc.getElementById('sidebar-start-time');
				var endTimeForm = doc.getElementById('sidebar-end-time');

				var oldColor = startTimeForm.style.backgroundColor;

				startTimeForm.style.backgroundColor = '#ff4e4e';
				endTimeForm.style.backgroundColor = '#ff4e4e';

				setTimeout(function() { startTimeForm.style.backgroundColor = oldColor; }, 1500);
				setTimeout(function() { endTimeForm.style.backgroundColor = oldColor; }, 1500);
			}
		});		
	}

	// -------------------------------------------------------------
	var showNextButton = function(data, destination, currentPageName, validate) 
	// -------------------------------------------------------------
	{
		showButton(data, destination, 'next-page', currentPageName, validate);
	}

	// -------------------------------------------------------------
	var showPreviousButton = function(data, destination, currentPageName, validate) 
	// -------------------------------------------------------------
	{
		showButton(data, destination, 'previous-page', currentPageName, validate);
	}

	// -------------------------------------------------------------
	var getTimestampInfoWindow = function(position, timeString) 
	// -------------------------------------------------------------
	{
		if ( typeof timeString === 'undefined') { var timeString = ''; }		
		var info = document.createElement('div');
		info.setAttribute('class', 'timestamp');


		info.innerHTML = '<form class="timestamp-form" onclick="false">'+
				'<br />'+
				'<input type="text" name="time" class="timestamp" value="'+timeString+'"/>'+
				// '<input type="hidden" name="position-lat" value="' + position.lat() + '"/>'+
				// '<input type="hidden" name="position-lng" value="' + position.lng() + '"/>'+
			'</form>';
		var infoLabel = document.createElement('label');
		infoLabel.setAttribute('class', 'timestamp-label');
		infoLabel.setAttribute('for', 'time');
		infoLabel.innerHTML = 'Time';
		info.insertBefore(infoLabel, info.firstChild);		
		return {
			'content': info,
			'label': infoLabel
		};
	}

	// --------------------------------------------------------------
	var getClosedInfoWindow = function(position, timeString) 
	// --------------------------------------------------------------
	{
		if ( typeof timeString === 'undefined') { var timeString = ''; }
		var placeholder = document.createElement('div');
		var label = document.createElement('div');
		label.setAttribute('class', 'timestamp-label');
		label.style['font-size'] = '14pt';
		label.innerHTML = timeString;
		placeholder.setAttribute('class', 'timestamp-closed')
		placeholder.innerHTML = '<form class="placeholder-form">'+
				// '<input type="hidden" name="position-lat" value="' + position.lat() + '"/>'+
				// '<input type="hidden" name="position-lng" value="' + position.lng() + '"/>'+
			'</form>';
		placeholder.insertBefore(label, placeholder.firstChild);
		return {
			'content': placeholder,
			'label': label
		};
	}

	// Need to make sure that this works for both timestamp windows that are open AND closed
	// ---------------------------------------------------------------
	var getTimestamps = function(xs) 
	// ---------------------------------------------------------------
	{
		var timestamps = [];
		for(var i = 0; i < xs.length; i++) {
			var timestamp = xs[i];
			var time = timestamp.getContent().childNodes[0][0].value;
			var position = (function() { return { lat: timestamp.getPosition().lat(), lng: timestamp.getPosition().lng()}; })();
			timestamps.push({ time: time, position: position });
		}
		return timestamps;
	}

// ----------------------------------------------------------------------
	var isValidTime = function(timeString) 
// ----------------------------------------------------------------------
	{
		var regex = /^(\d|[1][0-2])(:([0-5]\d))?\s?(AM|PM)$/i;
		return regex.test(timeString);
	}

// ---------------------------------------------------------------
	var getIcon = function()
// ---------------------------------------------------------------
	{
		return {
			url: "../marker.png",
			anchor: new google.maps.Point(10,10)
		};
	}

// ---------------------------------------------------------------------
	var getCloseButton = function(content)
// ---------------------------------------------------------------------	
	{
		var imgs = Array.prototype.slice.apply(content.parentNode.getElementsByTagName('img'));
		resultImgs = [];
		for (var i = 0; i < imgs.length; i++) {
			if (imgs[i].src.indexOf('close-icon.png') !== -1) {
				resultImgs.push(imgs[i]);
			}
		}
		return resultImgs[0];
	}

// ---------------------------------------------------------------------
	var addTimestampMarker = function(polyline, position, timeString)
// ---------------------------------------------------------------------	
	{
		var timestamp = {};
		var open = true;
		var openedContent = getTimestampInfoWindow(position, timeString);
		var closedContent = getClosedInfoWindow(position, timeString)
		timestamp.opened = new InfoBox({
			content: openedContent.content,
			position: position,
			boxStyle: {
				background: '#ffffff',
				opacity: 1,
				padding: '5px',
				width: '60px',
				height: '60px',
				'border-radius': '7px'
			},
			closeBoxURL: "../images/close-icon.png",
			pixelOffset: new google.maps.Size(-34,-95),
			map: map
		});
		timestamp.closed = new InfoBox({
			content: closedContent.content,
			position: position,
			boxStyle: {
				background: '#ffffff',
				opacity: 1,
				padding: '5px',
				width: '60px',
				height: '60px',
				'border-radius': '7px'
			},
			closeBoxURL: "../images/close-icon.png",
			pixelOffset: new google.maps.Size(-34,-95)
		});		
		timestamp.pyramid = new google.maps.Marker({
			icon: { url: "../images/pyramid.png", anchor: new google.maps.Point(10,30) },
			shape: { type: "rect", coords: [0,0,20,20] },
			position: position,
			draggable: true,
			map: map		
		});
		timestamp.open = function() {
			timestamp.opened.open(map, timestamp.pyramid);
			timestamp.pyramid.setMap(map);
			timestamp.closed.close();
			open = true;
		}
		timestamp.close = function() {
			timestamp.opened.setMap(null);
			timestamp.closed.open(map, timestamp.pyramid);
			open = false;
		}
		timestamp.isOpen = function() {
			return open;
		}

		google.maps.event.addListener(timestamp.pyramid, 'drag', function(event) {
			var dragPosition = mapcalc(map, doc).closestPointOnPolyline(polyline, timestamp.pyramid.getPosition());
			timestamp.pyramid.setPosition(dragPosition);
			google.maps.event.addListener(timestamp.pyramid, 'dragend', function(event) {
				timestamp.closed.setPosition(dragPosition);
			});			
		});		

		google.maps.event.addDomListener(openedContent.label, 'click', function() { timestamp.close(); 	});
		google.maps.event.addDomListener(closedContent.label, 'click', function() { timestamp.open();   });

		google.maps.event.addListener(timestamp.opened, 'closeclick', function() {
			timestamp.pyramid.setMap(null);
		});
		google.maps.event.addListener(timestamp.closed, 'closeclick', function() {
			timestamp.pyramid.setMap(null);
		});		

		timestamp.open();
		return timestamp;
	}

/* SUB-MODULE: spatialsurvey.instructions */
// -----------------------------------------------------------------------------------
	var instructions = (function() 
// -----------------------------------------------------------------------------------
	{
		var data = {};
		data.content = [];

		var setupPrimaryInstructions = function() {
			var extra = doc.getElementById('extra');
			extra.innerHTML = '<div id="welcome">'+
				'<div class="close-box">'+
					'<img src="../images/close-icon.png"/>'+
				'</div>'+				
				'<div id="welcome-content">'+
				'</div><!-- #welcome-content -->'+
				'<button id="next-instruction">Next</button>'+				
			  '</div><!-- #welcome -->';
		}
		var setupSidebarInstructions = function() {
			var instructions = doc.createElement('div');
			instructions.id = 'instructions';

			// initialize the instructions sidebar to be hidden
			instructions.style.display = 'none';
			instructions.innerHTML = getSidebarContent();
			map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(instructions);
		}
		var showPrimaryInstructions = function(drawingManager) {
			data.primaryIsVisible = true;
			var welcome = doc.getElementById('welcome');
			var welcome_content = doc.getElementById('welcome-content');

			welcome.style.display = 'block';

			if (doc.getElementById('instructions') != null) { 			
				doc.getElementById('instructions').style.display = 'none';			
			}				

			// initialize welcome screen
		    var welcome_screen_index = 0;
		    var content = getPrimaryContent();
		    welcome_content.innerHTML = content[welcome_screen_index];
		    google.maps.event.addDomListener(doc.getElementById('next-instruction'), 'click', function() {
				console.log(welcome_screen_index);
				if (welcome_screen_index < content.length - 1) { 
				    welcome_screen_index += 1;
				    welcome_content.innerHTML = content[welcome_screen_index]; 
				}
				else { startDrawing(drawingManager); }
			});
		}
		var hidePrimaryInstructions = function() {
			data.primaryIsVisible = false;
			doc.getElementById('welcome').style.display = 'none';
			google.maps.event.clearListeners(doc.getElementById('next-instruction'), 'click');

			doc.getElementById('instructions').style.display = 'block';
		}
		var startDrawing = function(drawingManager, initDrawingManager) {
			hidePrimaryInstructions();		
			drawingManager.setMap(map);			

			google.maps.event.addDomListener(doc.getElementById('instructions-content'), 'click', function() {
				// here is where you set the time in the primary instructions thing
				showPrimaryInstructions(drawingManager);
			});
			google.maps.event.removeListener(initDrawingManager);				
		}
		var setPrimaryContent = function(array) { data.content = array; }	
		var getPrimaryContent = function() { return data.content; }
		var setSidebarContent = function(content) { data.sidebar = content; }
		var getSidebarContent = function() { return data.sidebar; }
		var getStartTime = function() {
			if (data.primaryIsVisible)
				var userStartTime = doc.getElementById('primary-start-time');
			else if (data.primaryIsVisible === false)
				var userStartTime = doc.getElementById('sidebar-start-time')
			return userStartTime.value;
		}
		var getEndTime = function() {
			if (data.primaryIsVisible)
				var userEndTime = doc.getElementById('primary-end-time');
			else if (data.primaryIsVisible === false)
				var userEndTime = doc.getElementById('sidebar-end-time')
			return userEndTime.value;
		}

		var init = function(drawingManager, options) {
			if (typeof options !== 'undefined') {
				if (typeof options.content !== 'undefined') {
					setPrimaryContent(options.content);
				}
				if (typeof options.sidebar !== 'undefined') {
					setSidebarContent(options.sidebar);
				}
			}

			// initialize main instructions
			setupPrimaryInstructions();

			// initialize instructions sidebar
			setupSidebarInstructions();	

			showPrimaryInstructions(drawingManager);	

			// event handler to close welcome screen
			var welcome_close = doc.getElementsByClassName('close-box')[0];
			google.maps.event.addDomListener(welcome_close, 'click', function() {
				startDrawing(drawingManager, initDrawingManager);
			});	

			// if user clicks outside of welcome screen, then start drawing
			var initDrawingManager = google.maps.event.addListener(map, 'click', function() {
				startDrawing(drawingManager, initDrawingManager);				
			});							
		}

		return {
			'init': init,
			'setPrimaryContent': setPrimaryContent,
			'getPrimaryContent': getPrimaryContent
		}
	}());

	String.prototype.capitalize = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	}

	// public methods and constructors for module spatialsurvey
	return {
		'personPath': personPath, 
		'showNextButton': showNextButton,
		'addTimestampMarker': addTimestampMarker,
		'getTimestamps': getTimestamps,
		'instructions': instructions,
		'isValidTime': isValidTime

	};
};

// -----------------------------------------------------------------------------
var mapcalc = function(map, doc) 
// -----------------------------------------------------------------------------
{

	var map = map;
	var verbose = false;

// -----------------------------------------------------------------------------
	var comparePoints = function(a, b) 
// -----------------------------------------------------------------------------
	{
		if (google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord) < google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord)) 
			return -1;
		if (google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord) < google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord))
			return 1;
		else
			return 0;
	}

// ----------------------------------------------------------------------------
	var placeMarker = function(point) 
// ----------------------------------------------------------------------------
	{
		var marker = new google.maps.Marker({
			position: point,
			map: map
		});
		return marker;
	}

	var validDeleteUrl = false;

// ---------------------------------------------------------------
	var getDeleteUrl = function() 
// ---------------------------------------------------------------
	{
		var deleteUrl = 'http://i.imgur.com/RUrKV.png';
		if (!validDeleteUrl) {
			var request = new XMLHttpRequest();
			request.open('GET', deleteUrl, false);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) { validDeleteUrl = true; };
				}
			};
			request.send();
		}
		if (validDeleteUrl) { return deleteUrl;	}
		else throw "Link to delete vertex image is broken.";
	}

// --------------------------------------------------------------
	var getUndoButton = function(doc) 
// --------------------------------------------------------------
	{
		var images = doc.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == 'https://maps.gstatic.com/mapfiles/undo_poly.png')
				return images[i];
		}
		return -1;
	};

// --------------------------------------------------------------
	var getDeleteButton = function(doc)
// --------------------------------------------------------------
	{
		var images = doc.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == getDeleteUrl())
				return images[i];
		}
		return -1;
	};

// --------------------------------------------------------------
	var addDeleteButton = function(doc, polyline)
// --------------------------------------------------------------
	{
		var deleteButton = doc.createElement('div');
		deleteButton.setAttribute('style', 'overflow-x: hidden; overflow-y: hidden; position: absolute; width: 30px; height: 27px; top: -10px; left: 5px;');
		deleteButton.innerHTML = '<img src="' + getDeleteUrl() + '" class="deletePoly" style="height:auto; width:auto; position: absolute; left:0;"/>';
		google.maps.event.addDomListener(deleteButton, 'mouseover', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '-30px';
		});	
		google.maps.event.addDomListener(deleteButton, 'mouseout', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '0';
		});
		google.maps.event.addDomListener(deleteButton, 'mousedown', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '-60px';
		});	
		google.maps.event.addDomListener(deleteButton, 'mouseup', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '0';		
		});
		return deleteButton;

	};

// ----------------------------------------------------------------------
	var rightClickButton = function(map, doc, polyline)
// ----------------------------------------------------------------------
	{
		var deleteButton = addDeleteButton(doc, polyline);
		var rightClickDiv = new InfoBox({
			content: deleteButton,
			closeBoxURL: "../images/close-icon.png",
			visible: false,
		});

		/* Need to define these methods (unfortunately) because
		 * 	1. InfoBox method isVisible() is not implemented (although documentation says it is)
		 * 	2. InfoBox attribute visible says whether the infobox is visible ON OPEN, not whether it is visible.`
		 */
		rightClickDiv.mapCalcVisibility = false;
		rightClickDiv.mapCalcShow = function() {
			rightClickDiv.show();
			rightClickDiv.mapCalcVisibility = true;
		}
		rightClickDiv.mapCalcHide = function() {
			rightClickDiv.hide();
			rightClickDiv.mapCalcVisibility = false;
		}
		rightClickDiv.mapCalcIsVisible = function() {
			return rightClickDiv.mapCalcVisibility;
		}

		google.maps.event.addListener(polyline, 'rightclick', function(point) {
			if (point.vertex != null) getUndoButton(doc).style.display = 'none';
		});	

		google.maps.event.addListener(polyline.getPath(), 'set_at', function(point) {
			if (!rightClickDiv.mapCalcIsVisible()) { getUndoButton(doc).style.display = 'block'; }
			else { getUndoButton(doc).style.display = 'none'; }
		});

		google.maps.event.addListener(polyline, 'rightclick', function(point) {
			if (point.vertex != null) {
				rightClickDiv.setPosition(point.latLng);
				rightClickDiv.mapCalcShow();
				rightClickDiv.open(map);		

				// Move the delete button if user drags its associated vertex.  Otherwise, hide it.
				var setAtListener = google.maps.event.addListener(polyline.getPath(), 'set_at', function(newpoint) {
					if (newpoint == point.vertex) 
						rightClickDiv.setPosition(polyline.getPath().getAt(newpoint));
					else {
						rightClickDiv.mapCalcHide();
					}
				});

				// This prevents the user from right-clicking many times in succession on the same
				// vertex and thereby deleting many more than one vertex.
				google.maps.event.clearListeners(deleteButton, 'click');

				google.maps.event.addDomListener(deleteButton, 'click', function(event) {
					polyline.getPath().removeAt(point.vertex);
					rightClickDiv.mapCalcHide();
				});
				google.maps.event.addDomListener(map, 'click', function() {
					rightClickDiv.mapCalcHide();
					/* If we don't clear the listener here, this is what happens:
					 *	 listener gets registered on vertex N
					 *	 vertex N is deleted
					 *	 listener still deletes vertex N on rightclick, but the number N now refers to a different vertex
					 */
					google.maps.event.clearListeners(deleteButton, 'click');
					google.maps.event.removeListener(setAtListener);
				});
			}
		});	
		return rightClickDiv;
	};

/* 
 * Latitude is treated as the dependent variable (x) and longitude is independent (y).  This is 
 * convenient because the amount of stretching in the mercator projection depends on latitude,
 * not longitude.
 */
// ------------------------------------------------------------
	var Line = function(pointSlope) 
// ------------------------------------------------------------
	{
		var line = {};
		var latToLngScalingFactor = function(lat) {
		        var unitDistanceLat = google.maps.geometry.spherical.computeDistanceBetween(
		                new google.maps.LatLng(lat - 0.1, -87.600732),
		                new google.maps.LatLng(lat + 0.1, -87.600732)
		        );

		        var unitDistanceLng = google.maps.geometry.spherical.computeDistanceBetween(
		                new google.maps.LatLng(41.790113, -87.500732),
		                new google.maps.LatLng(41.790113, -87.700732)
		        );
		        return unitDistanceLat/unitDistanceLng;
		};
		line.getSlope = function() {
			if (pointSlope.hasOwnProperty('slope')) { return pointSlope.slope; }
			else 
			{
				var top = pointSlope.point1.lng() - pointSlope.point2.lng();
				var bottom = pointSlope.point1.lat() - pointSlope.point2.lat();			
				return top/bottom;
			}
		}
		line.getIntercept = function() {
			return pointSlope.point1.lng() - line.getSlope()*pointSlope.point1.lat();
		}
		line.extrapolate = function(latitude) {
			return new google.maps.LatLng(latitude, line.getSlope()*latitude + line.getIntercept());
		}
		line.getPerpendicularThroughPoint = function(point) {
			return Line({
				'slope': latToLngScalingFactor(point.lat())*line.getPerpendicularSlope(),
				'point1': point
			});
		}
		line.distanceToLine = function(point) {
			var dlat = (pointSlope.point1.lat() - point.lat())^2;
			var dlng = (pointSlope.point1.lng() - point.lng())^2;
			return Math.sqrt(dlat + dlng);
		}
		line.getPerpendicularSlope = function () { return -1/line.getSlope(); };
		line.intersection = function(otherLine) {
			var top = line.getIntercept() - otherLine.getIntercept();
			var bottom = otherLine.getSlope() - line.getSlope();

			var lng = line.getSlope()*(top/bottom) + line.getIntercept();

			return new google.maps.LatLng(top/bottom, lng);
		}

		return line;
	}

// ---------------------------------------------------------------------------------------
	var closestPointOnPolyline = function(polyline, point)
// ---------------------------------------------------------------------------------------
	{
		var path = polyline.getPath().getArray().slice(0);
		var intersections = [];
		for (var n = 0; n < path.length - 1; n++) {
			var line = Line({'point1': path[n], 'point2': path[n+1]});
			var intersectionPoint = line.intersection(line.getPerpendicularThroughPoint(point));
			if (isBetween(path[n], path[n+1], intersectionPoint)) {
				intersections.push({
					'index': n,
					'point': intersectionPoint,
					'distance': google.maps.geometry.spherical.computeDistanceBetween(point, intersectionPoint)
				});
			}
		}
		intersections.push({
			'index': 0,
			'point': closestVertex(point, polyline),
			'distance': google.maps.geometry.spherical.computeDistanceBetween(point, closestVertex(point, polyline))

		});
		intersections.sort(function(a,b) { return a.distance - b.distance; });

		return intersections[0].point;
	}

// ----------------------------------------------------------------------------
	var isBetween = function(endpt1, endpt2, pt) 
// ----------------------------------------------------------------------------
	{
		var lat1 = (endpt1.lat() <= pt.lat()) && (pt.lat() <= endpt2.lat());
		var lat2 = (endpt2.lat() <= pt.lat()) && (pt.lat() <= endpt1.lat());
		var betweenLat = lat1 || lat2;

		var lng1 = (endpt1.lng() <= pt.lng() && pt.lng() <= endpt2.lng());
		var lng2 = (endpt2.lng() <= pt.lng() && pt.lng() <= endpt1.lng());
		var betweenLng = lng1 || lng2;

		return betweenLat && betweenLng;
	}

// takes a LatLng point and a polyline
// -----------------------------------------------------------------------------
	var closestVertex = function(point, polyline) 
// -----------------------------------------------------------------------------
	{
		var path = polyline.getPath().getArray().slice(0);
		path.sort(function(a,b) { 
			return google.maps.geometry.spherical.computeDistanceBetween(a, point) - google.maps.geometry.spherical.computeDistanceBetween(b, point);
		});
		return path[0];
	}

// ------------------------------------------------------------------------------
	var distanceAlongPolyline = function(polyline, lastVertex, nextPoint) 
// ------------------------------------------------------------------------------	
	{
		var partialPath = new google.maps.Polyline({
			path: polyline.getPath().getArray().slice(0, lastVertex).push(nextPoint)
		});
		return google.maps.geometry.spherical.computeLength(partialPath);
	}

// -------------------------------------------------------------------------------
	var distributeTimeStamps = function(polyline, startTime, endTime) 
// -------------------------------------------------------------------------------	
	{
		/* These variables remain constant, and so may safely be referenced by functions defined herein. */
		var path = polyline.getPath().getArray();
		var totalLength = google.maps.geometry.spherical.computeLength(path);
		var totalTime = 3;
		var time = Math.ceil(totalTime);
		var delta = totalLength/time;

		var segmentLength = function(i) { 
			return google.maps.geometry.spherical.computeDistanceBetween(polyline.getPath().getAt(i), polyline.getPath().getAt(i+1));
		}
		var segmentVerticalChange = function(i) {
			return google.maps.geometry.spherical.computeDistanceBetween(
				polyline.getPath().getAt(i), 
				new google.maps.LatLng(polyline.getPath().getAt(i + 1).lat(), polyline.getPath().getAt(i).lng())
			);			
		}

		var getSpilloverPastVertex = function(info) {
			if (info.currentVertex < path.length - 1) {
				var thisSegmentLength = segmentLength(info.currentVertex);
				return info.spillover + ((info.i + 1) - info.oldI)*delta - thisSegmentLength;
			}
			else return 0;
		}

		var getVerticalDistance = function(info) {
			var thisSegmentLength = segmentLength(info.currentVertex);
			var thisSegmentVerticalChange = segmentVerticalChange(info.currentVertex);
			var verticalDelta = delta*thisSegmentVerticalChange/thisSegmentLength;

			info.verticalDistance = verticalDelta;
			while ( getSpilloverPastVertex(info) > 0 ) {
				info.spillover = getSpilloverPastVertex(info);
				info.currentVertex += 1;

				if (info.currentVertex < path.length - 1) {
					var nextSegmentLength = segmentLength(info.currentVertex);
					var nextSegmentVerticalChange = segmentVerticalChange(info.currentVertex);

					var verticalSpillover = info.spillover*nextSegmentVerticalChange/nextSegmentLength;
				}
				else {
					var verticalSpillover = 0;
				}

				info.basePoint = polyline.getPath().getAt(info.currentVertex);
				info.oldI = info.i + 1;
				info.verticalDistance = verticalSpillover;
			}
			return info;
		};

		var thisTimestampInfo = {
			'basePoint': polyline.getPath().getAt(0),
			'i': 0,
			'currentVertex': 0,
			'spillover': 0,
			'oldI': 0,
			'verticalSpillover': 0
		};
		spatialsurvey(map, doc).addTimestampMarker(polyline, closestPointOnPolyline(polyline, thisTimestampInfo.basePoint), startTime);	
		for (var i = 0; i < time; i++) {
			thisTimestampInfo = getVerticalDistance(thisTimestampInfo);
	
			if (thisTimestampInfo.currentVertex < path.length - 1) {
				var endpoint1 = polyline.getPath().getAt(thisTimestampInfo.currentVertex);
				var endpoint2 = polyline.getPath().getAt(thisTimestampInfo.currentVertex + 1);
				var line = Line({
					'point1': endpoint1, 
					'point2': endpoint2
				});

				thisTimestampInfo.basePoint = line.extrapolate(thisTimestampInfo.basePoint.lat() + Math.sgn(endpoint2.lat() - endpoint1.lat())*thisTimestampInfo.verticalDistance*metersToLat(thisTimestampInfo.basePoint));	
			}
			// placeMarker(thisTimestampInfo.basePoint);
			spatialsurvey(map, doc).addTimestampMarker(polyline, thisTimestampInfo.basePoint, '');	
			thisTimestampInfo.i++;
		}
	}

	// public methods and constructors
	return {
		'closestPointOnPolyline': closestPointOnPolyline, 
		'rightClickButton': rightClickButton,
		'placeMarker': placeMarker,
		'distributeTimeStamps': distributeTimeStamps
	}

};

// ---------------------------------------------------------------------
	Math.sgn = function(x) 
// ---------------------------------------------------------------------	
	{
	    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
	}

// ---------------------------------------------------------------------
	Math.sinh = function(x) 
// ---------------------------------------------------------------------
	{
		return 0.5*(Math.exp(x) - Math.exp(-x));
	}

// ---------------------------------------------------------------------
	Math.cosh = function(x) 
// ---------------------------------------------------------------------
	{
		return 0.5*	(Math.exp(x) + Math.exp(-x));
	}

// ---------------------------------------------------------------------
	Math.tanh = function(x) 
// ---------------------------------------------------------------------
	{
		return Math.sinh(x)/Math.cosh(x);
	}

// ---------------------------------------------------------------------
	Math.atanh = function(x) 
// ---------------------------------------------------------------------
	{
		return 0.5*Math.log((1+x)/(1-x));
	}

// ---------------------------------------------------------------------
	Math.cot = function(x)
// ---------------------------------------------------------------------
{
	return 1/Math.tan(x);
}

// ---------------------------------------------------------------------
	Math.sec = function(x)
// ---------------------------------------------------------------------
{
	return 1/Math.cos(x);
}

// ---------------------------------------------------------------------
	var bearing = function(point1, point2) 
// ---------------------------------------------------------------------
	{
		var top = Math.atanh(Math.sin(point2.lat()));
		var bottom = point2.lng() - equatorialIntercept(point1, point2);
		return top/bottom;
	}

// ---------------------------------------------------------------------
	var equatorialIntercept = function(point1, point2)
// ---------------------------------------------------------------------
	{
		var y1 = Math.atanh(Math.sin(point1.lat()));
		var y2 = Math.atanh(Math.sin(point2.lat()));
		var top = y2*point1.lng() - y1*point2.lng();
		var bottom = y2 - y1;
		return top/bottom;
	}

// ---------------------------------------------------------------------
	var rhumbLineLatitude = function(point1, point2, longitude)
// ---------------------------------------------------------------------
{
	var azimuth = Math.cot(bearing(point1, point2));
	var lambda = equatorialIntercept(point1, point2)
	return Math.asin(Math.tanh(azimuth*(longitude - lambda)));
}

// eccentricity from WGS84
var eccentricity = 0.08181919084;

// semi-major axis in meters
var semiMajorAxis = 6378137;

var aMap = function(map) {
	var top = 256*Math.pow(2,map.getZoom());
	var bottom = 2*Math.PI;
	return top/bottom;
}

var dx = function(map, latitude) { 
	var top = aMap(map)*Math.sec(latitude)*Math.sqrt(1 - (eccentricity*Math.sin(latitude))^2);
	var bottom = semiMajorAxis;
	return top/bottom;
}

var metersToLat = function(point) {
	var latDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat() + 1, point.lng())
	);
	return 1/latDistance;
}

var metersToLng = function(point) {
	var lngDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat(), point.lng() + 1)
	);
	return 1/lngDistance;
}


