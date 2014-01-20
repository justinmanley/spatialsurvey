spatialsurvey
=============

Spatialsurvey is a survey platform for geographic/spatial queries built using the Google Maps Javascript API.  Let's say you want to figure out how your employees are commuting to work so you can decide whether it's worthwhile to invest in a car-sharing or bike-subsidy program.  Or maybe you're a college interested in learning how your students are getting  around campus so you can determine what areas are popular, and which areas are underused.  This framework is perfect for all of these tasks because it lets users answer spatial questions in a spatial way: by drawing on a map.  Sure, you could answer all of those questions by simply tagging your subjects with a GPS locator beacon or tracking them over WiFi - but a survey is often less expensive, requires vastly less investment in infrastructure, and is less invasive.

Spatialsurvey is extremely lightweight with few dependencies other than the Google Maps Javascript API itself (it doesn't even depend on jQuery).

Spatialsurvey exports two modules, spatialsurvey, and mapcalc.

mapcalc
-------------
mapcalc.closestPointOnPolyline(polyline, point)
mapcalc.distributeTimeStamps(polyline, startTime, endTime)
