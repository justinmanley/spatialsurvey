test("getResouceUrl()", function() {
	equal(getResourceUrl('hello.js'), '../../dowsing-js/resources/hello.js');
});

test("timestringToInteger()", function() {
	equal(timestringToInteger("10am"), 10);
});