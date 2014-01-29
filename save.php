<html class="thankyou">
<link href='http://fonts.googleapis.com/css?family=Andada' rel='stylesheet' type='text/css'>
<link rel="stylesheet" type="text/css" href="../css/style.css">
<?php 

require_once('config.php');

// session_start();

// print_r($_SESSION['path-data']);

$conn = mysqli_connect($dbhost, $dbuser, $dbpassword);
if ( !$conn ) { die ('Could not connect: ' . mysqli_error($conn)); }

$pathstring = require_once('kml_template.php');
$path = mysqli_escape_string($conn, $pathstring);
$sql = <<<sqlstring
INSERT INTO paths ( id, kml_string, time_submitted ) VALUES ( DEFAULT, "$path", NOW() )
sqlstring;

mysqli_select_db($conn, 'spatialsurvey');

$retval = mysqli_query($conn, $sql);
if ( !$retval ) { die('Could not enter data: ' . mysqli_error($conn)); }
echo '<div id="thankyou">Thank you for your input.<br />Your response will help us improve campus.</div>\n';
mysqli_close($conn);
?>
</html><!-- .thankyou -->