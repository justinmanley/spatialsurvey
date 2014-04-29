test("getResouceUrl()", function() {
	equal(getResourceUrl('hello.js'), '../../spatialsurvey/resources/hello.js');
});

test("timestringToInteger()", function() {
	equal(timestringToInteger("10am"), 10);
});