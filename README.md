spatialsurvey
=============================

`spatialsurvey` is a library for creating geographic survey applications using the Google Maps Javascript API.  Geographic surveys - that is, surveys in the questions are geographic or spatial, rather than verbal, are a useful tool for

	* campus planners
	* architects
	* urban planners
	* HR departments
	* logistics specialists

to learn about how people are getting around.  The `spatialsurvey` library has been used at the University of Chicago to develop surveys for campus planning that were administered to approximately 5,000 students (see the code survey application [here](https://github.com/manleyjster/wherewewalk)).

Structure
==============================
The library is divided into two modules: `spatialsurvey`, and `mapHelper`.  The first, `spatialsurvey`, contains classes and functions for managing survey response data, as well as UI classes for building a survey interface.

The second module, `mapHelper`, contains utility methods for geographic calculations and conversions not provided by the google maps Javascript API.

Copyright
==============================

Copyright (c) 2014 The University of Chicago

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.