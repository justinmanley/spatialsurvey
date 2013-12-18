<?php session_start(); ?>
<!DOCTYPE html>
<html>
	<head>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" type="text/css" href="../css/style.css">
		<script type="text/javascript"
			src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=drawing,geometry&sensor=false">
		</script>
		<script type="text/javascript"
			src="http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox.js">
		</script>
		<script type="text/javascript" src="../mapUtilities.js"></script>
		<script type="text/javascript" src="index.js"></script>
	</head>
	<body>
		<div id="map-canvas"></div>
		<div id="extra"><?php if (isset($extra)) echo $extra; ?></div>
	</body>
</html>