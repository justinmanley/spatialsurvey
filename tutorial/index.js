function initialize() {
	var mapCenter = new google.maps.LatLng(41.78961025632396, -87.59967505931854);
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: mapCenter,
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	});
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYLINE,
		drawingControl: false,
		polylineOptions: {
			editable: true,
			strokeColor: '#ffff4d'
		},
		map: map
	});
	var surveyHelper = spatialsurvey(map, document, drawingManager);
	var mapHelper = mapcalc(map, document);

	// surveyHelper.instructions.showProgress(0, 4);

	surveyHelper.instructions.init(drawingManager, {
		content: [{
			content:  '<h2>The University of Chicago Pedestrian Movement Survey</h2>'+
						'<p>Thanks for helping us to improve campus.  In a minute, we\'re going to ask you a few questions about how you move around campus:<ul><li>What path did you take as you walked or biked around campus yesterday?</li><li>When were you moving around campus yesterday?</li></ul></p>'+
						'<p>But first, we\'re going to lead you through a quick tutorial of this survey tool.</p>',
			buttonText: 'NEXT'
		}],
	}, function() { surveyHelper.tutorial.create(drawingManager) });

}

google.maps.event.addDomListener(window, 'load', initialize);
