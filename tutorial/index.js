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

	surveyHelper.instructions.init(drawingManager, {
		content: [{
			content:  '<h2>Where Do You Walk?</h2>'+
						'<hr />'+
						'<p>Campus is always changing, and it is the job of Facilities Services to make sure that it\'s changing for the better.</p>'+
						'<p>New buildings, pedestrian zones, paths, and lighting are all part of that change.</p>'+
						'<p>Understanding how you use campus will help us design these campus improvements so that they are beautiful, comfortable, and useful to you.</p>'
			,
			buttonText: 'NEXT'
		},
		{
			content:  '<h2>Where Do You Walk?</h2>'+
						'<hr />'+
						'<p>This survey will ask you to describe the path that you took around campus yesterday by tracing it on the map.</p>'+
						'<hr />'+
						'<p>First we\'ll lead you through a quick tutorial of the survey tool, then we\'ll ask you to draw the path you took yesterday.  There are three screens in all, and the survey takes about four minutes to complete.</p>'
			,
			buttonText: 'NEXT'
		}],
	}, function() { surveyHelper.tutorial.create(drawingManager) });

	surveyHelper.instructions.showProgress(1, 4, 'Tutorial');


}

google.maps.event.addDomListener(window, 'load', initialize);
