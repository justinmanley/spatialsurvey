<?php session_start(); ?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8"/>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" type="text/css" href="../../spatialsurvey/css/style.css"/>
		<link rel="stylesheet" type="text/css" href="../../css/style.css"/>
		<script type="text/javascript"
			src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=drawing,geometry&sensor=false">
		</script>
		<script type="text/javascript" src="../../spatialsurvey/resources/infobox.js"></script>
		<script type="text/javascript" src="../../spatialsurvey/resources/prefixfree.min.js"></script>
		<script type="text/javascript" src="../../spatialsurvey/core.js"></script>
		<script type="text/javascript" src="../../spatialsurvey/colors/rainbowvis.js"></script>		
		<script type="text/javascript" src="index.js"></script>
	</head>
	<body>
		<div id="map-canvas"></div>
		<div id="extra"><?php if (isset($extra)) echo $extra; ?></div>
	</body>
</html>