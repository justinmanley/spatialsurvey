function initialize() {
	var mapCenter = new google.maps.LatLng(41.790113, -87.600732);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true
		}
	});

	google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) { 
		data.setPath(polyline.getPath().getArray());
		drawingManager.setOptions({
			drawingMode: null
		});		
		mapcalc.rightClickButton(map, document, polyline);
	});

	var data = spatialsurvey.personPath();

	function startDrawing() {
		document.getElementById('extra').removeChild(document.getElementById('welcome'));
		spatialsurvey.showInstructions(map, document);				
		drawingManager.setMap(map);

		spatialsurvey.showNextButton(map, document, data, 'add_time', function() {
			var startTime = document.getElementById('start-time').value;
			var endTime = document.getElementById('end-time').value;
			data.setStartTime(startTime);
			data.setEndTime(endTime);	
		});
		
		google.maps.event.removeListener(initDrawingManager);	
	}	

	var welcomeContent = [
		'<div id="welcome">'+
			'<div class="close-box">X</div>'+
			'<div id="welcome-content">'+
				'<h3>Instructions</h3>'+
					'<p>Use the polyline tool at the top of the page to draw the path that you took around campus yesterday.  Please be as specific as possible!</p>'+
					'<p>If you make a mistake, don\'t worry; you\'ll have a chance to edit the path you\'ve drawn before you proceed to the next step.</p>'+
					'<p>When you\'re done, double-click on the last point to save your path, then click the button at the bottom of the page to advance to the next step.</p>'+
					'<img src="../images/instruction1.gif" />'+
			'</div><!-- #welcome-content -->'+
			'<button class="next-instruction">Next</button>'+				
		  '</div><!-- #welcome -->'
	];
	var welcome = document.getElementById('extra');
	var welcome_screen_index = 0;
	welcome.innerHTML = welcomeContent[welcome_screen_index];
	google.maps.event.addDomListener(document.getElementsByClassName('next-instruction')[0], 'click', function() {
		if (welcome_screen_index < welcomeContent.length - 1) { 
			welcome_screen_index += 1;
			welcome.innerHTML = welcomeContent[welcome_screen_index]; 
		}
		else { startDrawing(); }
	});

	// event handler to close welcome screen
	var welcome_close = document.getElementsByClassName('close-box')[0];
	google.maps.event.addDomListener(welcome_close, 'click', startDrawing);

	// if user clicks outside of welcome screen, then start drawing
	var initDrawingManager = google.maps.event.addListener(map, 'click', startDrawing);		
}

google.maps.event.addDomListener(window, 'load', initialize);