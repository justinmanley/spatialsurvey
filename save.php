<?php 
session_start();

require_once('../../config.php');

$conn = mysqli_connect($dbhost, $dbuser, $dbpassword);
if ( !$conn ) { die ('Could not connect: ' . mysqli_error($conn)); }

$user_id = $_SERVER['persistent-id'];
$jsondata = mysqli_escape_string($conn, $_SESSION['path-data']);
$kmlstring = require_once('kml_template.php');
$kml = mysqli_escape_string($conn, $kmlstring);

$path_insert = <<<sqlstring
INSERT INTO paths ( id, user_id, kml_string, json_string, time_submitted ) VALUES ( DEFAULT, "$user_id", $kml", "$jsondata", NOW() )
sqlstring;

mysqli_select_db($conn, $dbname);

$retval = mysqli_query($conn, $path_insert);
if ( !$retval ) { die('Could not enter data: ' . mysqli_error($conn)); }

echo '<div id="thankyou">Thank you for your input.<br />Your response will help us improve campus.</div>\n';
mysqli_close($conn);
?>