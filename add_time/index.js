if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingControl: false
	});	

	// all user data is stored in this object
	var surveyHelper = spatialsurvey(map, document);
	var mapHelper = mapcalc(map, document);
	var data = surveyHelper.personPath();
	data.display(function() {

		setTimeout(function() { map.panTo(data.getPolyline().getPath().getAt(0)) }, 1000);

		// surveyHelper.instructions.showProgress(1, 4);		

		surveyHelper.showNextButton(data, 'save', 'add_time', function() {
			return true;
		}, function() {
			//
		});

		instructionsPrimary = [
			{ 
				content: '<h2>What time?</h2>'+
						'<h3>We\'ve distributed times evenly along your path, from the time that you arrived on campus to when you left.  But that\'s probably not how you move around campus.</h3>'+
						'<p>You can correct the times by dragging them along your path, or by clicking and editing a time. You can also create a new timestamp by clicking on the path.</p>'+
						'<p>This will help give us a better idea of the ebb and flow of foot traffic around campus.</p>',
				buttonText: 'GO'
			}		
		]

		surveyHelper.instructions.init(drawingManager, { 
			content: instructionsPrimary
		});		

		google.maps.event.addListener(map, 'click', function(event) {			
			var userPolyline = data.getPolyline();
			var tolerance = 0.05*Math.pow(1.1, -map.getZoom());
			if (google.maps.geometry.poly.isLocationOnEdge(event.latLng, userPolyline, tolerance)) {
				var position = mapHelper.closestPointOnPolyline(userPolyline, event.latLng);
				surveyHelper.timestamp(userPolyline, position, '', true).create();
			}			
		});
	});

}

google.maps.event.addDomListener(window, 'load', initialize);
