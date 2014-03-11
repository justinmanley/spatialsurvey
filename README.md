Dowsing.js
========================

Dowsing.js is a survey platform for geographic/spatial queries built using the Google Maps Javascript API.  Let's say you want to figure out how your employees are commuting to work so you can decide whether it's worthwhile to invest in a car-sharing or bike-subsidy program.  Or maybe you're a college interested in learning how your students are getting  around campus so you can determine what areas are popular and which are underused.  This framework is perfect for all of these tasks because it lets users answer spatial questions in a spatial way: by drawing on a map.  A survey built using this framework is a good option to answer these kinds of questions because it is often less expensive, requires less investment in infrastructure, and is less invasive than other methods.

Spatialsurvey is extremely lightweight with few dependencies other than the Google Maps Javascript API itself (it doesn't even depend on jQuery).

This project is released under the MIT License.  Full documentation coming soon.

Documentation
=============================

```spatialsurvey.pathData.create(pathDataOptions)```

Methods:

```load()```
```tostring()```
```getPolyline()```
```getStartTime()```
```getEndTime()```
```setStartTime(startTime::timeString)```
```setEndTime(endTime::string)```
```getPolylineCoordinates(coordinates::array)```
```setPolylineCoordinates(coordinates::array)```
```setHasResponse(response::boolean)```

------------------------------

```spatialsurvey.tutorial.create(
	drawingManager::google.maps.drawing.DrawingManager, 
	lessons::array
)```

```lesson = {
	instruction::instructionOptions,
	fixed::bool,
	advance::function
}
```

```spatialsurvey.tutorial.standardCurriculum```

------------------------------

```spatialsurvey.sidebar.create(sidebarOptions)```

Methods:



------------------------------

```spatialsurvey.instructions.create(instructionsOptions)```

Methods:

------------------------------

```
spatialsurvey.showNextButton(
	data::pathData, 
	destinationPage::string,
	currentPage::string,
	validate::function
)
```

Copyright
==============================

Copyright (c) 2014 The University of Chicago

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.