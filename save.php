<?php 

require_once('config.php');

$conn = mysqli_connect($dbhost, $dbuser, $dbpassword);
if ( !$conn ) { die ('Could not connect: ' . mysqli_error($conn)); }

$pathstring = require_once('kml_template.php');
$path = mysqli_escape_string($conn, $pathstring);
$sql = "INSERT INTO paths ( id, path, time_submitted ) VALUES ( DEFAULT, $path, NOW() )";

mysqli_select_db($conn, 'spatialsurvey');

$retval = mysqli_query($conn, $sql);
if ( !$retval ) { die('Could not enter data: ' . mysqli_error($conn)); }
echo "Entered data successfully.\n";
mysqli_close($conn);
?>