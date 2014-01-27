function initialize() {
	var map = new google.maps.Map(document.getElementById("map-canvas"), {
		center: new google.maps.LatLng(41.790113, -87.600732),
		zoom: 18,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var data = spatialsurvey.personPath();
	data.display(map, function() {
		spatialsurvey.showInstructions(map, document);
		spatialsurvey.showNextButton(map, document, data, 'save');	
	});	

}

google.maps.event.addDomListener(window, 'load', initialize);
