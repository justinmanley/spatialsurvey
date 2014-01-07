<?php 
// header('Content-type: application/vnd.google-earth.kml+xml');

session_start();
$data = json_decode($_SESSION['path-data']);

$kml_output = <<<output1
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://www.opengis.net/kml/2.2 http://schemas.opengis.net/kml/2.2.0/ogckml22.xsd http://www.google.com/kml/ext/2.2 http://code.google.com/apis/kml/schema/kml22gx.xsd">
<Document id="Accessable_Routes_UTM">
  <name>Accessable_Routes_UTM</name>
  <Snippet></Snippet>
  <Folder id="FeatureLayer0">
    <name>Accessable_Routes_UTM</name>
    <Snippet></Snippet>
output1;

$output = '';

for ($i = 0; $i < sizeof($data->path) - 1; $i++)
{
  $vertex1 = $data->path[$i];
  $vertex2 = $data->path[$i+1];

  $line_id = sprintf('%05d', $i);

  $lat1 = $vertex1->lat;
  $lng1 = $vertex1->lng;
  $lat2 = $vertex2->lat;
  $lng2 = $vertex2->lng; 

  $output .= <<<sup

  <Placemark id="ID_$line_id">
    <name>0</name>
    <Snippet></Snippet>
    <description><![CDATA[<html xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:msxsl="urn:schemas-microsoft-com:xslt">

  <head>
    
  <META http-equiv="Content-Type" content="text/html"/>

  <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>

  </head>

  <body style="margin:0px 0px 0px 0px;overflow:auto;background:#FFFFFF;">

  <table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-collapse:collapse;padding:3px 3px 3px 3px">

  <tr style="text-align:center;font-weight:bold;background:#9CBCE2">

  <td>0</td>

  </tr>

  <tr>

  <td>

  <table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-spacing:0px; padding:3px 3px 3px 3px">

  <tr>

  <td>FID</td>

  <td>0</td>

  </tr>

  <tr bgcolor="#D4E4F3">

  <td>Id</td>

  <td>0</td>

  </tr>

  </table>

  </td>

  </tr>

  </table>

  </body>

  </html>

  ]]></description>
        <styleUrl>#LineStyle00</styleUrl>
        <MultiGeometry>
          <LineString>
            <extrude>0</extrude><altitudeMode>clampedToGround</altitudeMode>
            <coordinates>$lng1,$lat1,0 $lng2,$lat2,0</coordinates>
          </LineString>
        </MultiGeometry>
      </Placemark>

sup;
}

$ending = <<<ending
</Folder>
<Style id="LineStyle00">
  <LabelStyle>
    <color>00000000</color>
    <scale>0.000000</scale>
  </LabelStyle>
  <LineStyle>
    <color>ff00a16e</color>
    <width>1.000000</width>
  </LineStyle>
  <PolyStyle>
    <color>00000000</color>
    <outline>0</outline>
  </PolyStyle>
</Style>
</Document>
</kml>
ending;

return $kml_output . $output . $ending;

?>

