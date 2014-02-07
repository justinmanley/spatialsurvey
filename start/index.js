function initialize() {
	var mapCenter = new google.maps.LatLng(41.78961025632396, -87.59967505931854);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 19,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true,
			strokeColor: '#ffff4d'
		}
	});
	var surveyHelper = spatialsurvey(map, document, drawingManager);
	var mapHelper = mapcalc(map, document);

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
		data.setPath(polyline.getPath().getArray());
		drawingManager.setOptions({
			drawingMode: null
		});		
		mapHelper.rightClickButton(polyline);

		surveyHelper.showNextButton(data, 'add_time', 'start', function() {
			var startTime = document.getElementById('sidebar-start-time').value;
			var endTime = document.getElementById('sidebar-end-time').value;	
			if ( surveyHelper.isValidTime(startTime) && surveyHelper.isValidTime(endTime)) {
				data.setStartTime(startTime);
				data.setEndTime(endTime);
				return true;
			}
			else { 
				return false; 
			}
		}, function() {
			var instructionsSidebar = document.getElementById('instructions-content');
			var errorMessage = document.createElement('p');
			errorMessage.id = 'error-message';
			errorMessage.innerHTML = 'Please enter your start and end time.';
			instructionsSidebar.appendChild(errorMessage);	

			setTimeout(function() { errorMessage.style.backgroundColor = oldColor; }, 1500);
		});
	});

	var data = surveyHelper.personPath();

	var instructionsPrimary = [
		{ 
			content: '<h2>Your Daily Path</h2>'+
					'<h3>Draw the path that you took around campus yesterday.</h3>'+
					'<p>If you live in Hyde Park, start drawing when you left home.  Otherwise, start when you arrived on campus.</p>'+
					'<p>We would like to link the path to a time, so before you move on, make sure to enter the time your path starts and ends.</p>',
			buttonText: 'START'
		}
	];

	var instructionsSidebar = '<div id="instructions-content">'+
									'<h2>Instructions</h2>'+
									'<p>Draw the path that you took around campus yesterday.</p>'+								
									'<p>When did your path start?  When did it end?  Make sure to include the time of day (am/pm).</p>'+
								'</div><!-- #instructions-content -->'+
								'<p>'+
								'<form>'+
									'<div id="start-end-time-question">'+
										'<label for="start-time">Start Time</label>'+
										'<br />'+
										'<input name="start-time" id="sidebar-start-time"/>'+
									'</div>'+
									'<div id="start-end-time-question">'+
										'<label for="end-time">End Time</label>'+
										'<br />'+
										'<input name="end-time" id="sidebar-end-time"/>'+
									'</div>'+
								'</form>'+
								'</p>'+
								'<p>When you\'re done, click the button at the bottom of the page to advance to the next step.</p>';

	surveyHelper.instructions.init(drawingManager, { 
		content: instructionsPrimary, 
		sidebar: instructionsSidebar 
	});

	var campus = [
		new google.maps.LatLng(41.79496100666715, -87.60619282722473),
		new google.maps.LatLng(41.79321329484045, -87.60617136955261),
		new google.maps.LatLng(41.79324723144615, -87.60133266448975),
		new google.maps.LatLng(41.78411307315453, -87.60118246078491),
		new google.maps.LatLng(41.78414507343588, -87.59785652160645),
		new google.maps.LatLng(41.79500824582489, -87.59815692901611)
	]

	var illinois = [
		new google.maps.LatLng(42.5116, -90.6290),
		new google.maps.LatLng(42.4924, -87.0213),
		new google.maps.LatLng(41.7641, -87.2067),
		new google.maps.LatLng(41.7611, -87.5226),
		new google.maps.LatLng(39.6417, -87.5336),
		new google.maps.LatLng(39.3566, -87.5308),
		new google.maps.LatLng(39.1386, -87.6517),
		new google.maps.LatLng(38.9445, -87.5157),
		new google.maps.LatLng(38.7294, -87.5047),
		new google.maps.LatLng(38.6115, -87.6146),
		new google.maps.LatLng(38.4944, -87.6544),
		new google.maps.LatLng(38.3740, -87.7780),
		new google.maps.LatLng(38.2856, -87.8371),
		new google.maps.LatLng(38.2414, -87.9758),
		new google.maps.LatLng(38.1454, -87.9291),
		new google.maps.LatLng(37.9788, -88.0225),
		new google.maps.LatLng(37.8900, -88.0458),
		new google.maps.LatLng(37.7881, -88.0321),
		new google.maps.LatLng(37.6349, -88.1529),
		new google.maps.LatLng(37.5097, -88.0609),
		new google.maps.LatLng(37.4149, -88.4152),
		new google.maps.LatLng(37.2828, -88.5086),
		new google.maps.LatLng(37.1428, -88.4221),
		new google.maps.LatLng(37.0585, -88.4990),
		new google.maps.LatLng(37.1428, -88.7256),
		new google.maps.LatLng(37.2128, -88.9453),
		new google.maps.LatLng(37.1559, -89.0689),
		new google.maps.LatLng(37.0376, -89.1650),
		new google.maps.LatLng(36.9894, -89.2873),
		new google.maps.LatLng(37.1505, -89.4356),
		new google.maps.LatLng(37.2762, -89.5345),
		new google.maps.LatLng(37.3996, -89.4315),
		new google.maps.LatLng(37.6936, -89.5358),
		new google.maps.LatLng(37.9767, -89.9670),
		new google.maps.LatLng(38.2587, -90.3790),
		new google.maps.LatLng(38.6169, -90.2376),
		new google.maps.LatLng(38.7573, -90.1744),
		new google.maps.LatLng(38.8247, -90.1167),
		new google.maps.LatLng(38.8846, -90.1799),
		new google.maps.LatLng(38.9680, -90.4504),
		new google.maps.LatLng(38.8654, -90.5905),
		new google.maps.LatLng(39.0405, -90.7086),
		new google.maps.LatLng(39.2301, -90.7306),
		new google.maps.LatLng(39.3173, -90.8350),
		new google.maps.LatLng(39.3853, -90.9338),
		new google.maps.LatLng(39.5559, -91.1398),
		new google.maps.LatLng(39.7262, -91.3554),
		new google.maps.LatLng(39.8570, -91.4406),
		new google.maps.LatLng(39.9940, -91.4941),
		new google.maps.LatLng(40.1694, -91.5120),
		new google.maps.LatLng(40.3497, -91.4667),
		new google.maps.LatLng(40.4166, -91.3939),
		new google.maps.LatLng(40.5566, -91.4021),
		new google.maps.LatLng(40.6265, -91.2524),
		new google.maps.LatLng(40.6963, -91.1151),
		new google.maps.LatLng(40.8232, -91.0890),
		new google.maps.LatLng(40.9312, -90.9792),
		new google.maps.LatLng(41.1642, -91.0162),
		new google.maps.LatLng(41.2355, -91.1055),
		new google.maps.LatLng(41.4170, -91.0368),
		new google.maps.LatLng(41.4458, -90.8487),
		new google.maps.LatLng(41.4417, -90.7251),
		new google.maps.LatLng(41.5816, -90.3516),
		new google.maps.LatLng(41.7713, -90.2637),
		new google.maps.LatLng(41.9023, -90.1538),
		new google.maps.LatLng(42.0819, -90.1758),
		new google.maps.LatLng(42.2021, -90.3598),
		new google.maps.LatLng(42.2936, -90.4395),
		new google.maps.LatLng(42.4032, -90.5356),
		new google.maps.LatLng(42.4843, -90.6564)
	];

	var shading = new google.maps.Polygon({
		paths: [ illinois, campus ],
		fillOpacity: 0.65
	});
	shading.setMap(map);	

}

google.maps.event.addDomListener(window, 'load', initialize);