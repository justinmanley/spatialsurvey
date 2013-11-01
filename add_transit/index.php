<?php $page = 'add_transit'; ?>
<!DOCTYPE html>
<html>
	<head>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<link rel="stylesheet" type="text/css" href="css/style.css">
		<script type="text/javascript"
			src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=drawing&sensor=false">
		</script>
		<script type="text/javascript" src="js/init.js"></script>
		<script type="text/javascript" src="js/<?php echo $page; ?>.js"></script>
	</head>
	<body>
		<div id="map-canvas"></div>
	</body>
</html>