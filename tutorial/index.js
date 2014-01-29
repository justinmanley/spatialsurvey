function initialize() {
	var mapCenter = new google.maps.LatLng(41.789013, -87.599732);
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
		}
	});
	var surveyHelper = spatialsurvey(map, document, drawingManager);
	var mapHelper = mapcalc(map, document);

	surveyHelper.instructions.showProgress(0, 4);

	surveyHelper.tutorial.create(mapCenter);

}

google.maps.event.addDomListener(window, 'load', initialize);
