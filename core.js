/** 
 * @name spatialsurvey
 * @namespace  
 */
spatialsurvey = (function() {
	/** 
	 * Contains the environment for the module.
	 * @memberOf spatialsurvey
	 * @private
	 */
	var environment = {
		verbose: true
	};

	/** 
	 * Set up environment. 
	 * @memberOf spatialsurvey
	 * @param {Object} opt - Options object.
	 * @param {Object} opt.map - A google.maps.map object.
	 */
	function init(opt) {
		environment.map = opt.map;
		environment.drawingManager = opt.drawingManager;
		environment.appName = opt.appName || 'spatialsurvey-app';

		initClickNoDrag();
	}

	/**
	 * Returns a new SurveyResponse object.
	 * @constructor
	 * @memberOf spatialsurvey
	 * @returns {SurveyResponse}
	 */
	function SurveyResponse()
	{
		window.addEventListener('beforeunload', function() {
			sessionStorage.setItem(environment.appName + '-data', toString());
		});

		var data = {};

		/* Retrieve stored data, if any, and populate data object. */
		storedData = sessionStorage.getItem(environment.appName + '-data');
		if ( storedData !== null )
		{
			debug(storedData, "storedData");
			parsedData = JSON.parse(storedData);
			debug(data, "data");
			for ( key in parsedData ) {
				/* data[key] is a geoJSON object */
				if ( typeof parsedData[key].type !== 'undefined' ) {
					if ( parsedData[key].type === "LineString" || parsedData[key].type === "Point") {
						data[key] = mapHelper.fromGeoJSON(parsedData[key]);
					}
				}
				else {
					data[key] = parsedData[key];
				}
			}
		}

		/** 
		 * @memberOf spatialsurvey.SurveyResponse
		 * @param {string} key 
		 * @param {Object} value
		 */
		function setValue(key, value) {
			data[key] = value;
		}
		this.setValue = setValue;

		/** 
		 * @memberOf spatialsurvey.SurveyResponse
		 * @param {string} key
		 * @returns {Object}
		 */
		function getValue(key) {
			return data[key];
		}
		this.getValue = getValue;

		/** 
		 * Deletes all response data from the SurveyResponse object.
		 * @memberOf spatialsurvey.SurveyResponse
		 */
		function reset() {
			data = {};
		}
		this.reset = reset;

		/** 
		 * Answers whether any survey response has been recorded yet.
		 * @returns {boolean}
		 */
		function isEmpty() {
			for ( key in data ) {
				if ( data.hasOwnProperty(key))
					return false;
			}
			return true;
		}
		this.isEmpty = isEmpty;

		/** 
		 * Submit the survey responses to the database.
		 */
		function submit() {
			var request = new XMLHttpRequest();
			request.open('POST', '../../spatialsurvey/save.php', true);
			request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.send(environment.appName + '-data=' + toString());
		}
		this.submit = submit;

		/** 
		 * Serializes the SurveyResponse object to JSON format.
		 * @memberOf spatialsurvey.SurveyResponse		 
		 * @returns {string} 
		 */
		function toString() {
			var stringable = {};	

			for ( key in data ) {
				/* data[key] is a google.maps.LatLng object. */
				if ( typeof data[key].lat === 'function' )
					stringable[key] = mapHelper.toGeoJSON(data[key]);
				/* data[key] is a google.maps.Polyline object. */
				else if ( typeof data[key].getPath === 'function' )
					stringable[key] = mapHelper.toGeoJSON(data[key]);
				else 
					stringable[key] = data[key];
			}

			return JSON.stringify(stringable);
		}
		this.toString = toString;		
	}

	/** 
	 * Intended for implementation by the application developer.  By default returns an empty FeatureCollection GeoJSON object.
	 * @memberOf spatialsurvey.SurveyResponse
	 * @returns {GeoJSON}
	 */
	SurveyResponse.prototype.toGeoJSON = function() {
		throw "Error: SurveyResponse.toGeoJSON has not been implemented.\nThe application developer should implement this function."
	}

	/** 
	 * Utility function for console debugging that is controlled by the verbose variable.
	 * @memberOf spatialsurvey
	 * @param {object} object
	 * @param {string} description - Identify the object being examined.
	 */
	function debug(object, description) {
		if (environment.verbose) {
			if (typeof description !== 'undefined')
				console.log(description);			
			console.log(object);			
		}
	}

	/** 
	 * Advances the user to the next page in the survey.
	 * @memberOf spatialsurvey
	 * @param {Object} options
	 * @param {string} options.destinationPageName
	 */
	function advance(options) {
		window.location.assign('../' + options.destinationPageName);
	}	

	/** 
	 * Utility function returning a google.maps.LatLng object.
	 * @memberOf spatialsurvey
	 * @param {Object} coord
	 * @returns {google.maps.LatLng}
	*/
	function createLatLng(coord) {
		return new google.maps.LatLng(coord.lat, coord.lng);
	}

	/** 
		@constructor
		@memberOf spatialsurvey		
		@param {Object} options
		@param {string} options.id
		@param {string} options.text
		@param {function} options.onClick
	*/
	function Button(opt) {	
		var button = document.createElement('button');
		button.id = opt.id;
		button.setAttribute('class', 'dowsing-button');
		button.innerHTML = opt.text;
		
		/** 
		 * Adds the button to the bottom center control position on the map. 
		 * @memberOf spatialsurvey.Button
		 */
		this.show = function() {
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(button);			
		};

		google.maps.event.addDomListener(button, 'click', opt.onClick);
	}

	/** 
	 * Tests whether a timestring is valid using a regular expression.
	 * @memberOf spatialsurvey
	 * @param {string} timeString
	 * @returns {bool}
	 */
	function isValidTime(timeString) 
	{
		var regex = /^(\d|[1][0-2])(:([0-5]\d))?\s?(AM|PM)$/i;
		return regex.test(timeString);
	}

	var infoBoxManager = (function()
	{
		var groups = {};
		var init = function(identifier) {
			groups[identifier] = [];
		};
		var register = function(identifier, infoObject) {
			groups[identifier].push(function() {
				if ( infoObject.hasOwnProperty('setMap') ) // user has passed in an infoBox
					infoObject.setMap(null); 
				if ( infoObject.hasOwnProperty('infoBox') ) // user has passed in an infoObject
					infoObject.infoBox.setMap(null);
				if ( infoObject.hasOwnProperty('anchor') )
					infoObject.anchor.setMap(null);
			});
		};
		var clear = function(identifier) {
			if ( !groups.hasOwnProperty(identifier) ) {
				throw "There is no InfoBox group answering to that identifier.";
			} 
			else {
				for (var i = 0; i < groups[identifier].length; i++) {
					groups[identifier][i]();
				}
				groups[identifier] = [];
			}
		};
		return {
			'init': init,
			'clear': clear,
			'register': register
		};

	}());

	/** 
	 * @constructor
	 * @memberOf spatialsurvey
	 * @param {Object} options
	 * @param {Object} options.polyline - google.maps.Polyline object
	 * @param {Object} options.position - google.maps.LatLng object
	 * @param {string} options.startTime
	 * @param {string} options.endTime
	 * @param {string} options.type - duration or single
	*/
	function Timestamp(options) {
		// Timestamp defaults
		var data = {
			polyline: new google.maps.Polyline({}),
			position: new google.maps.LatLng({}),
			startTime: '',
			endTime: '',
			type: 'duration'
		};

		// initialize Timestamp data
		for ( var property in options ) {
			if ( options.hasOwnProperty(property) ) {
				data[property] = options[property];
			}
		}

		var openedContent = timestampOpenedContent(data);
		var closedContent = timestampClosedContent(data);		

		var timestamp = {
			opened: new InfoBox({
				content: openedContent.content,
				position: data.position,
				boxStyle: {
					background: '#ffffff',
					opacity: 1,
					padding: '5px',
					width: '130px',
					height: '60px',
					'border-radius': '7px'
				},
				closeBoxURL: getResourceUrl('close-icon.png'),
				pixelOffset: new google.maps.Size(-68,-95)
			}),
			closed: new InfoBox({
				content: closedContent.content,
				position: data.position,
				boxStyle: {
					background: '#ffffff',
					opacity: 1,
					padding: '5px',
					width: '105px',
					height: '20px',
					'border-radius': '7px'
				},
				closeBoxURL: "",
				pixelOffset: new google.maps.Size(-55,-55)
			}),
			pyramid: new google.maps.Marker({
				icon: { url: getResourceUrl('pyramid.png'), anchor: new google.maps.Point(10,30) },
				shape: { type: "rect", coords: [0,0,20,20] },
				position: data.position
			})
		};

		/**
		 * Show the timestamp on the map. 
		 * @memberOf spatialsurvey.Timestamp
		 * @param {string} state - open, closed, or none.
		 */
		function show(state) {
			if ( state == 'open' ) {
				timestamp.opened.open(environment.map, timestamp.pyramid);
				timestamp.pyramid.setMap(environment.map);
				open = true;
				return this;
			}
			else if ( state == 'closed' ) {
				var startTime = openedContent.getStartTime();
				var endTime = openedContent.getEndTime();
				if ( isValidTime(startTime) && ( isValidTime(endTime) || data.type === 'single' ) ) {
					timestamp.opened.setMap(null);

					closedContent.updateTimes(startTime, endTime);
					// closedContent.updateColor(startTime, endTime);	

					timestamp.closed.open(environment.map, timestamp.pyramid);
					open = false;							
				} 
				else {
					openedContent.clearTime();
					var inputs = openedContent.content.getElementsByClassName('timestamp');
					var oldColor = inputs[0].style.backgroundColor;
					var flashWarning = function(i) {
						inputs[i].style.backgroundColor = '#ff4e4e';
						setTimeout(function() { inputs[thisInput].style.backgroundColor = oldColor; }, 1000);
					};
					for (var i = 0; i < inputs.length; i++) {
						flashWarning(i);
					}	
				}
			}
			return this;
		}

		/** 
		 * @memberOf spatialsurvey.Timestamp	
		 * @param {Object} position - A google.maps.LatLng object. 
		*/
		function savePosition(position) {
			timestamp.opened.getContent().getElementsByClassName('timestamp-position-lat')[0].value = position.lat();
			timestamp.opened.getContent().getElementsByClassName('timestamp-position-lng')[0].value = position.lng();

			timestamp.closed.getContent().getElementsByClassName('timestamp-position-lat')[0].value = position.lat();
			timestamp.closed.getContent().getElementsByClassName('timestamp-position-lng')[0].value = position.lng();	
		}

		timestamp.pyramid.setDraggable(true);
		google.maps.event.addListener(timestamp.pyramid, 'drag', function(event) {
			var dragPosition = mapHelper.closestPointOnPolyline(data.polyline, timestamp.pyramid.getPosition());
			timestamp.pyramid.setPosition(dragPosition);		
		});		
		google.maps.event.addListener(timestamp.pyramid, 'dragend', function(event) {
			timestamp.closed.setPosition(event.latLng);
			savePosition(event.latLng);
		});			

		google.maps.event.addListener(timestamp.opened, 'closeclick', function() {
			timestamp.pyramid.setMap(null);
			timestamp.opened.setMap(null);
			timestamp.closed.setMap(null);
		});	

		var overlay = new google.maps.OverlayView();
		overlay.draw = function() {};
		overlay.setMap(environment.map);

		var closedForm = closedContent.content.getElementsByClassName('timestamp-form')[0];
		google.maps.event.addDomListener(closedForm, 'mousedown', function() {
			var onTimestampDrag = google.maps.event.addDomListener(doc, 'mousemove', function(event) {
				dragTimestamp(event);
			});
			google.maps.event.addDomListener(doc, 'mouseup', function() {
				google.maps.event.removeListener(onTimestampDrag);
			});			
		});

		var openedLabel = openedContent.content.querySelectorAll('label[for=time]')[0];
		google.maps.event.addDomListener(openedLabel, 'click', function() { show('closed');  });
		google.maps.event.addDomListener(closedForm, 'click', function() { show('open');   });			

		var startPixelY;
		var startPixelX;							

		function dragTimestamp(event) {
			pauseEvent(event);

			var proj = environment.map.getProjection();
			var pos = timestamp.closed.getPosition();
			var p = proj.fromLatLngToContainerPixel(pos);					

			if ( typeof startPixelX !== 'undefined' ) {
				var newPoint = new google.maps.Point(p.x + (event.x - startPixelX), p.y + (event.y - startPixelY));
				var newLatLng = mapHelper.closestPointOnPolyline(data.polyline, proj.fromContainerPixelToLatLng(newPoint));
				timestamp.closed.setPosition(newLatLng);
				timestamp.pyramid.setPosition(newLatLng);
			}

			startPixelX = event.x;
			startPixelY = event.y;
		}

		function pauseEvent(e) {
		    if(e.stopPropagation) e.stopPropagation();
		    if(e.preventDefault) e.preventDefault();
		    e.cancelBubble=true;
		    e.returnValue=false;
		    return false;
		}

		function timestampOpenedContent(openedOptions) {
			if ( typeof openedOptions.startTime === 'undefined') { openedOptions.startTime = ''; }		
			if ( typeof openedOptions.endTime === 'undefined') { openedOptions.endTime = ''; }	
			var info = document.createElement('div');
			info.setAttribute('class', 'timestamp-opened timestamp-container');


			info.innerHTML = '<form class="timestamp-form" onclick="false">'+
					'<label class="timestamp-label" for="time">Time</label>'+
					'<br />'+
					'<fieldset class="timestamp-data">'+
						'<input type="text" name="start-time" class="timestamp" value="'+openedOptions.startTime+'"/>'+
						'<input type="text" name="end-time" class="timestamp" value="'+openedOptions.endTime+'"/>'+
						'<input type="hidden" name="position-lat" class="timestamp-position-lat" value="' + openedOptions.position.lat() + '"/>'+
						'<input type="hidden" name="position-lng" class="timestamp-position-lng" value="' + openedOptions.position.lng() + '"/>'+
					'</fieldset>'+
				'</form>';

			function getStartTime() {
				return info.querySelector('.timestamp[name=start-time]').value;
			}

			function getEndTime() {
				return info.querySelector('.timestamp[name=end-time]').value;
			}

			function clearTime() {
				info.querySelector('.timestamp').value = '';
			}

			return {
				'content': info,
				'getStartTime': getStartTime,
				'getEndTime': getEndTime,
				'clearTime': clearTime
			};
		}

		function timestampClosedContent(closedOptions) {
			if ( typeof closedOptions.startTime === 'undefined') { closedOptions.startTime = ''; }
			if ( typeof closedOptions.endTime === 'undefined') { closedOptions.endTime = ''; }

			var placeholder = document.createElement('div');
			var separator = closedOptions.type === 'double' ? ' - ' : '';

			placeholder.setAttribute('class', 'timestamp-closed timestamp-container');
			placeholder.innerHTML = '<form class="timestamp-form">'+
					'<label for="start-time" class="timestamp-label">'+closedOptions.startTime+'</label>'+
					separator+
					'<input type="hidden" name="start-time" class="timestamp" value="'+closedOptions.startTime+'"/>'+	
					'<label for="end-time" class="timestamp-label">'+closedOptions.endTime+'</label>'+							
					'<input type="hidden" name="end-time" class="timestamp" value="'+closedOptions.endTime+'"/>'+				
					'<input type="hidden" name="position-lat" class="timestamp-position-lat" value="' + closedOptions.position.lat() + '"/>'+
					'<input type="hidden" name="position-lng" class="timestamp-position-lng" value="' + closedOptions.position.lng() + '"/>'+
				'</form>';

			function updateTimes(updatedStartTime, updatedEndTime) {
				placeholder.querySelector('input[name=start-time]').value = updatedStartTime;
				placeholder.querySelector('input[name=end-time]').value = updatedEndTime;
				placeholder.querySelector('label[for=start-time]').innerHTML = updatedStartTime;
				placeholder.querySelector('label[for=end-time]').innerHTML = updatedEndTime;			
			}

			return {
				'content': placeholder,
				'updateTimes': updateTimes
			};
		}						

		this.show = show;
		this.savePosition = savePosition;
		return this;
	}

	/**
	 * @constructor
	 * @memberOf spatialsurvey
	 * @param {Object} options
	 * @param {Array} options.content - Each object in this array represents an instruction screen.  Parameters are content and buttonText.
	 * @param {function} options.action
	 * @param {function} options.hideAction 
	 */
	function Instructions(options) {
		// set defaults
		var data = { 
			content: [], 
			action: function() { },
			hideAction: function() { }
		};

		// initialize data object
		for ( var property in options) {
			if ( options.hasOwnProperty(property) ) {
				data[property] = options[property];
			}
		}

		// initialize the div element
		var extra = document.getElementById('extra');
		extra.innerHTML = '<div id="instructions-main">'+
			'<div class="close-box">'+
				'<img src="' + getResourceUrl('close-icon.png') + '"/>'+
			'</div>'+				
			'<div id="instructions-main-content">'+
			'</div><!-- #instructions-main-content -->'+
			'<button class="dowsing-button" id="next-instruction">Next</button>'+				
			'</div><!-- #instructions-main -->';
		document.getElementById('instructions-main').style.display = 'none';				
		
		/** 
		 * Displays the main instructions panel.
		 * @memberOf spatialsurvey.Instructions
		 */
		function show() {
			// if user defines hideAction, this allows primary and action to toggle back and forth
			data.hideAction();

			var primary = document.getElementById('instructions-main');
			var primary_content = document.getElementById('instructions-main-content');

			primary.style.display = 'block';

			// initialize instructions_main screen
		    var primary_screen_index = 0;
		    var content = data.content;
		    var nextButton = document.getElementById('next-instruction');

		    primary_content.innerHTML = content[primary_screen_index].content;
		    nextButton.innerHTML = typeof content[primary_screen_index].buttonText !== 'undefined' ? content[primary_screen_index].buttonText : 'NEXT';

		    google.maps.event.addDomListener(nextButton, 'click', function(event) {
				if (primary_screen_index < content.length - 1) { 
				    primary_screen_index += 1;
				    primary_content.innerHTML = content[primary_screen_index].content;
				    nextButton.innerHTML = typeof content[primary_screen_index].buttonText !== 'undefined' ? content[primary_screen_index].buttonText : 'NEXT';
				}
				else
					hide();
			});
		}
		this.show = show;

		/** 
		 * Hides the main instruction panel.
		 * @memberOf spatialsurvey.Instructions
		 */
		function hide() {
			document.getElementById('instructions-main').style.display = 'none';
			google.maps.event.clearListeners(document.getElementById('next-instruction'), 'click');

			data.action();
		}
		this.hide = hide;
		return this;
	}

	var sidebar = (function() {
		// set defaults
		data = {
			content: '',
			height: 395,
			sidebarOpenOnCreate: true,
			sidebarId: 'instructions-sidebar',
			help: {
				content: '', 
				teaser: '',
				contentId: 'help-content',
				teaserId: 'help-teaser'
			}
		};

		var sidebar = document.createElement('div');

		var create = function(options) {
			// initialize data object
			for ( var property in options) {
				if ( options.hasOwnProperty(property) ) {
					data[property] = options[property];
				}
			}
			sidebar.id = data.sidebarId;
			sidebar.innerHTML = data.content;
			sidebar.style.height = data.height;		

			var help = document.createElement('div');
			var helpContent = document.createElement('div');
			var helpTeaser = document.createElement('p');
			help.id = 'help-panel';
			helpContent.id = data.help.contentId;
			helpTeaser.id = data.help.teaserId;
			helpContent.innerHTML = data.help.content;
			helpTeaser.innerHTML = data.help.teaser;

			sidebar.appendChild(helpTeaser);
			sidebar.appendChild(helpContent);

			var show = function() {
				sidebar.style.display = 'block';	

				environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
				environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(sidebar);					
			};

			var hide = function() {
				sidebar.style.display = 'none';			
			};

			var toggleHelp = function() {
				var sidebar = document.getElementById(data.sidebarId);
				var openListener = google.maps.event.addDomListener(helpTeaser, 'click', function() {
					helpContent.style.display = 'block';		
					environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
					environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(sidebar);
					google.maps.event.removeListener(openListener);
					var closeListener = google.maps.event.addDomListener(helpTeaser, 'click', function() {
						helpContent.style.display = 'none';
						google.maps.event.removeListener(closeListener);
						environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
						environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(sidebar);				
						toggleHelp();
					});
				});					
			};	

			var refresh = function(action) {
				action();
				var thisSidebar = document.getElementById('instructions-sidebar');
				environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
				environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(thisSidebar);						
			};	

			return {
				'show': show,
				'hide': hide,
				'toggleHelp': toggleHelp,
				'refresh': refresh
			};		
		};	

		return { 
			'create': create,
		};
	}());

	function showProgress(currentScreen, max, description) 
	{
		var progressBar = document.createElement('div');
		var progressIndicator = document.createElement('div');
		var progressText = document.createElement('div');
		progressBar.id = 'progress-bar';
		progressIndicator.id = 'progress-indicator';
		progressText.id = 'progress-text';

		var widthFormat = /^([0-9]*)px$/;
		var progressBarWidth = 400;

		progressIndicator.style.width = (currentScreen/max)*progressBarWidth + 'px';

		progressText.innerHTML = currentScreen + ' : ' + description;

		progressBar.appendChild(progressIndicator);
		progressBar.appendChild(progressText);
		environment.map.controls[google.maps.ControlPosition.TOP_CENTER].push(progressBar);				
	}

	var tutorial = (function() {
		var drawingManager;

		// for sharing data between different lessons in the standard tutorial
		var standardTutorialData = {};

		// for the end-user of the framework to share data 
		// between different lessons in his/her custom tutorial
		var userTutorialData = {};


		// initialize the tutorialBox DOM element
		var tutorialBox = document.createElement('div');
		var tutorialText = document.createElement('div');
		var button = document.createElement('button');

		tutorialBox.id = 'tutorial-fixed-box';		
		tutorialText.id = 'tutorial-fixed-text';
		button.id = 'tutorial-button';
		button.setAttribute('class', 'dowsing-button');

		tutorialBox.appendChild(tutorialText);
		tutorialBox.appendChild(button);

		var overlay = new google.maps.OverlayView();
		overlay.draw = function() { };
		overlay.setMap(environment.map);

		var mapCanvas = document.getElementById('map-canvas');

		function create(manager, lessons) {
			drawingManager = manager;
			var TUTORIAL_START = 0;

			infoBoxManager.init('interactive');
			initClickNoDrag();

			document.addEventListener("lessoncomplete", function(event) {
				if ( event.detail.lessonIndex + 1 < lessons.length )
					nextLesson(lessons, event.detail.lessonIndex + 1);
				else if ( event.detail.lessonIndex == lessons.length - 1 ) {
					environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();
					var nextButton = document.createElement('a');
					nextButton.setAttribute('href', '../start/');
					nextButton.innerHTML = '<button class="dowsing-button">NEXT</button>';
					environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(nextButton);						
				}
			});

			document.addEventListener('mapUserError', function(event) {
				error.show(event.detail.message, function() { event.detail.action(); });
			});

			nextLesson(lessons, TUTORIAL_START);

		}

		function fixedTutorialBox(options) {
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();	
			infoBoxManager.clear('interactive');	
			button.style.display = 'none';

			tutorialBox.style.width = options.width + 'px';
			tutorialText.innerHTML = options.content;
			tutorialText.style.width = options.width + 'px';

			if ( options.hasButton === true ) {
				// need to provide more room if there is a button
				tutorialBox.style.width = (options.width + 80) + 'px';

				button.style.display = 'block';
				button.innerHTML = options.buttonText;

				google.maps.event.addDomListener(button, 'click', function() {
					dispatchLessonComplete();
				});
			}
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(tutorialBox);				
		}

		function interactiveTutorialBox(options, getPosition) {
			if ( typeof clear === 'undefined' || clear === true )
				environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();	

			infoBoxManager.clear('interactive');

			var tutorial = new InfoBox({
				content: '<div class="tutorial-movable-box">' + options.content + '</div>',
				boxStyle: {
					'background-color': '#ffffff',
					'width': options.width + 'px',
					'font-size': '14pt',					
				},
				position: options.getPosition(),
				map: map,
				closeBoxURL: "",
				pixelOffset: options.pixelOffset
			});
			var pyramid = new google.maps.Marker({
				icon: { url: getResourceUrl('pyramid.png'), anchor: new google.maps.Point(10,50) },
				shape: { type: "rect", coords: [0,0,20,20] },
				position: options.getPosition(),
				draggable: true,
				map: map		
			});

			tutorial.open(environment.map, pyramid);									

			infoBoxManager.register('interactive', { 'infoBox': tutorial, 'anchor': pyramid });			
		}

		function interactiveArrow() {
			//
		}		

		var dispatchLessonComplete = (function() {
			var lessonCounter = 0;
			return function(i) {
				if ( typeof i !== 'undefined' )
					lessonCounter = i;

				var lessonComplete = new CustomEvent("lessoncomplete", {
					detail: {
						'lessonIndex': lessonCounter
					}
				});
				document.dispatchEvent(lessonComplete);
				lessonCounter++;
			};
		}());

		function storeData(dataName, data) {
			userTutorialData[dataName] = data;
		}

		function retrieveData(dataName) {
			return userTutorialData[dataName];
		}

		function forgetData(dataName) {
			delete userTutorialData[dataName];
		}

		function nextLesson(lessons, lessonIndex) {
			// set defaults
			var thisLesson = {
				instruction: {
					content: '<p style="color: #FF0000">Error: No tutorial content set</p>',
					hasButton: true,
					buttonText: 'NEXT',
					width: 400,
					clearFixed: true,
					position: environment.map.getCenter()
				},
				advance: function() { }, 
				fixed: true,
			};

			// initialize the data for this stage of the tutorial
			for ( var data in lessons[lessonIndex] ) {
				if ( lessons[lessonIndex].hasOwnProperty(data) )
					thisLesson[data] = lessons[lessonIndex][data];
			}

			if ( thisLesson.fixed )
				fixedTutorialBox(thisLesson.instruction);
			else 
				interactiveTutorialBox(thisLesson.instruction);				

			thisLesson.advance();
		}

		var standardCurriculum = [
			{
				instruction: {
					content: 'Click anywhere on the map to start drawing.',
					hasButton: false,
					buttonText: 'NEXT',
					width: 250
				},
				fixed: true,
				advance: function() { 
					function onFirstPoint() {
						dispatchLessonComplete(0);
						document.removeEventListener('clicknodrag', onFirstPoint);
					}
					document.addEventListener('clicknodrag', onFirstPoint);
				}
			},
			{
				instruction: {
					content: 'Click somewhere else to draw a path.  To start, draw a path with three segments.',
					hasButton: false,
					buttonText: 'NEXT',
					width: 440
				},
				fixed: true,
				advance: function() { 
					var points = 1;
					var proj = environment.map.getProjection();
					console.log(proj);
					function onThirdPoint(event) {
						if ( points == 3 ) {
							var browserCursorX = event.detail.clientX;
							var browserCurxorY = event.detail.clientY;
							var browserPoint = new google.maps.Point(browserCursorX, browserCurxorY);
							standardTutorialData.position = proj.fromPointToLatLng(browserPoint);

							debug('at least three points in polyline');
							dispatchLessonComplete();
							document.removeEventListener('clicknodrag', onThirdPoint);	
						} 
						else 
							points++;
					}
					document.addEventListener('clicknodrag', onThirdPoint);

					var prematurePolylineComplete = google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
						var numberOfVertices = polyline.getPath().getArray().length;
						var verticesString = numberOfVertices == 1 ? 'vertex' : 'vertices';
						if ( numberOfVertices < 3 ) {
							document.removeEventListener('clicknodrag', onThirdPoint);								
							google.maps.event.removeListener(prematurePolylineComplete);

							var errorMessage = 'You created a line with only ' + numberOfVertices + ' ' + verticesString + ', probably because you clicked twice on the same point.<br />To draw a line, single-click along your desired path to place vertices on the map.';
							error.report(errorMessage, function() { 
								polyline.setMap(null);
								drawingManager.setOptions({ drawingMode: google.maps.drawing.OverlayType.POLYLINE});
								nextLesson(standardCurriculum, 0);
							});		
						}					
					});		
				}
			},
			{
				instruction: {
					content: 'To complete the path, click twice on the same point.',
					hasButton: false,
					buttonText: 'NEXT',
					width: 370
				},
				fixed: true,
				advance: function() { 
					var onCompletePolyline = google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
						drawingManager.setOptions({ drawingMode: null });

						mapHelper.rightClickButton(polyline);
						standardTutorialData.polyline = polyline;						

						console.log('path is completed');
						dispatchLessonComplete();
						google.maps.event.removeListener(onCompletePolyline);						
					});				
				}
			},
			{
				instruction: {
					content: 'Nice!  Now that you\'ve drawn a path, you can modify it by dragging vertices.  Give it a try!',
					hasButton: false,
					buttonText: 'NEXT',
					width: 560,
				},
				fixed: true,
				advance: function() { 
					var polyline = standardTutorialData.polyline;

					editPolyline = 0;

					function onEditPolyline() {
						editPolyline += 1;
						if ( editPolyline == 1 ) { 
							dispatchLessonComplete();
							google.maps.event.removeListener(insertListener);
							google.maps.event.removeListener(deleteListener);
							google.maps.event.removeListener(setListener);
						}
					}

					var insertListener = google.maps.event.addListener(polyline.getPath(), 'insert_at', onEditPolyline);
					var deleteListener = google.maps.event.addListener(polyline.getPath(), 'remove_at', onEditPolyline);
					var setListener = google.maps.event.addListener(polyline.getPath(), 'set_at', onEditPolyline);
				}
			},
			{
				instruction: {
					content: 'You can add new vertices to the line by dragging the dot in the middle of each segment.  Try it.',
					hasButton: false,
					buttonText: 'NEXT',
					width: 560,
				},
				fixed: true,
				advance: function() {
					var polyline = standardTutorialData.polyline;

					var secondVertex = polyline.getPath().getAt(1);
					var thirdVertex = polyline.getPath().getAt(2);

					var midpointLatitude = secondVertex.lat() + (1/2)*(thirdVertex.lat() - secondVertex.lat());
					var midpointLongitude = secondVertex.lng() + (1/2)*(thirdVertex.lng() - secondVertex.lng());

					var arrow = new google.maps.Marker({
						position: new google.maps.LatLng(midpointLatitude, midpointLongitude),
						icon: { 
							url: getResourceUrl("arrow-diagonal-down-small-white.png"), 
							anchor: new google.maps.Point(75,80)
						},
						map: environment.map						
					});

					function onInsertPoint() {
						dispatchLessonComplete();
						arrow.setMap(null);
						google.maps.event.removeListener(insertListener);
					}
					var insertListener = google.maps.event.addListener(polyline.getPath(), 'insert_at', onInsertPoint);
				}				
			},
			{
				instruction: {
					content: 'You can delete vertices by right-clicking on a vertex.  Try deleting a point.',
					hasButton: false,
					buttonText: 'NEXT',
					width: 560,
				},
				fixed: true,
				advance: function() {
					var polyline = standardTutorialData.polyline;

					function onDeletePoint() {
						dispatchLessonComplete();
						google.maps.event.removeListener(deleteListener);
					}
					var deleteListener = google.maps.event.addListener(polyline.getPath(), 'remove_at', onDeletePoint);
				}				
			},
			{
				instruction: {
					content: 'Great!  You\'re ready for the survey.',
					width: 380,
					hasButton: true,
					buttonText: 'NEXT'				
				},
				fixed: true
			}								
		];

		return {
			'standardCurriculum': standardCurriculum,
			'create': create
		};
	}());

	var error = (function() {
		var errorBox = document.createElement('div');
		var errorText = document.createElement('div');
		var errorAcknowledgeButton = document.createElement('button');
		errorBox.id = 'error-box';
		errorText.id = 'error-text';
		errorAcknowledgeButton.id = 'error-acknowledge-button';
		errorAcknowledgeButton.setAttribute('class', 'dowsing-button');
		errorAcknowledgeButton.innerHTML = 'OK';
		errorBox.appendChild(errorText);
		errorBox.appendChild(errorAcknowledgeButton);

		function report(message, action) {
			if ( typeof action === 'undefined')
				action = function() { };

			var mapUserError = new CustomEvent('mapUserError', {
				detail: {
					'message': message,
					'action': action
				}
			});

			document.dispatchEvent(mapUserError);
		}

		function show(message, action) {
			var currentContent = environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].pop();
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();	
			errorText.innerHTML = message;
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(errorBox);	

			var errorAcknowledged = google.maps.event.addDomListener(errorAcknowledgeButton, 'click', function() {
				google.maps.event.removeListener(errorAcknowledged);
				environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].clear();				
				environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(currentContent);
				
				action();
			});						
		}

		return {
			'report': report,
			'show': show
		};
	}());

	/** 
	 * Gets the URL. 
	 * @memberOf spatialsurvey
	 * @param {string} filename
	 * @returns {string}
	 */
	function getResourceUrl(filename) {
		return '../../spatialsurvey/resources/' + filename;
	}

	function initClickNoDrag() {
		var hasMoved = false;
		addEventListener('mousedown', function(){
			hasMoved = false;
			addEventListener('mousemove', onMove, false);
			addEventListener('mouseup', onUp, false);				
		}, false);	

		function onMove() {
			hasMoved = true;
		}
				
		function onUp(event) {
			removeEventListener('mousemove', onMove);
			removeEventListener('mouseup', onUp);

			if ( hasMoved === false ) {
				var clickNoDrag = new CustomEvent("clicknodrag", {
					detail: event
				});
				document.dispatchEvent(clickNoDrag);
			}
		}			
	}

	// public methods and constructors for module spatialsurvey
	return {
		'SurveyResponse': SurveyResponse,
		'Button': Button,
		'Timestamp': Timestamp,
		'Instructions': Instructions,
		'sidebar': sidebar,
		'showProgress': showProgress,	
		'tutorial': tutorial,
		'error': error,
		'isValidTime': isValidTime,
		'advance': advance,
		'getResourceUrl': getResourceUrl,
		'init': init
	};
}());

/** 
 * @name mapHelper
 * @namespace
 */
var mapHelper = (function()
{
	/** 
	 * Contains the environment for the module.
	 * @memberOf mapHelper
	 * @private
	 */
	var environment = {
		verbose: false
	};

	/** 
	 * Set up environment.
	 * @memberOf mapHelper
	 */
	function init(opt) {
		environment.map = opt.map;
		google.maps.event.addListener(opt.drawingManager, 'polylinecomplete', function(polyline) {
			rightClickButton(polyline);
		});
	}

	function comparePoints(a, b) 
	{
		if (google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord) < google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord)) 
			return -1;
		if (google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord) < google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord))
			return 1;
		else
			return 0;
	}

	function placeMarker(point) 
	{
		var marker = new google.maps.Marker({
			position: point,
			map: environment.map
		});
		return marker;
	}

	var validDeleteUrl = false;

// ---------------------------------------------------------------
	function getDeleteUrl() 
// ---------------------------------------------------------------
	{
		var deleteUrl = spatialsurvey.getResourceUrl('closebox.png');
		if (!validDeleteUrl) {
			var request = new XMLHttpRequest();
			request.open('GET', deleteUrl, false);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) { validDeleteUrl = true; }
				}
			};
			request.send();
		}
		if (validDeleteUrl) { return deleteUrl;	}
		else throw "Link to delete vertex image is broken.";
	}

// --------------------------------------------------------------
	function getUndoButton(doc) 
// --------------------------------------------------------------
	{
		var images = document.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == 'https://maps.gstatic.com/mapfiles/undo_poly.png')
				return images[i];
		}
		return -1;
	}

// --------------------------------------------------------------
	function getDeleteButton(doc)
// --------------------------------------------------------------
	{
		var images = document.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == getDeleteUrl())
				return images[i];
		}
		return -1;
	}

// --------------------------------------------------------------
	var addDeleteButton = function(doc, polyline)
// --------------------------------------------------------------
	{
		var deleteButton = document.createElement('div');
		deleteButton.setAttribute('style', 'overflow-x: hidden; overflow-y: hidden; position: absolute; width: 30px; height: 27px; top: -10px; left: 5px;');
		deleteButton.innerHTML = '<img src="' + getDeleteUrl() + '" class="deletePoly" style="height:auto; width:auto; position: absolute; left:0;"/>';
		google.maps.event.addDomListener(deleteButton, 'mouseover', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '-30px';
		});	
		google.maps.event.addDomListener(deleteButton, 'mouseout', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '0';
		});
		google.maps.event.addDomListener(deleteButton, 'mousedown', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '-60px';
		});	
		google.maps.event.addDomListener(deleteButton, 'mouseup', function() {
			deleteButton.getElementsByTagName('img')[0].style.left = '0';		
		});
		return deleteButton;

	};

// ----------------------------------------------------------------------
	var rightClickButton = function(polyline)
// ----------------------------------------------------------------------
	{
		var deleteButton = addDeleteButton(document, polyline);
		var rightClickDiv = new InfoBox({
			content: deleteButton,
			closeBoxURL: spatialsurvey.getResourceUrl('close-icon.png'),
			visible: false,
		});

		/* Need to define these methods (unfortunately) because
		 *  1. InfoBox method isVisible() is not implemented (although documentation says it is)
		 *  2. InfoBox attribute visible says whether the infobox is visible ON OPEN, not whether it is visible.`
		 */
		rightClickDiv.mapCalcVisibility = false;
		rightClickDiv.mapCalcShow = function() {
			rightClickDiv.show();
			rightClickDiv.mapCalcVisibility = true;
		};
		rightClickDiv.mapCalcHide = function() {
			rightClickDiv.hide();
			rightClickDiv.mapCalcVisibility = false;
		};
		rightClickDiv.mapCalcIsVisible = function() {
			return rightClickDiv.mapCalcVisibility;
		};

		google.maps.event.addListener(polyline, 'rightclick', function(point) {
			if (point.vertex !== null) getUndoButton(document).style.display = 'none';
		});	

		google.maps.event.addListener(polyline.getPath(), 'set_at', function(point) {
			if (!rightClickDiv.mapCalcIsVisible()) { getUndoButton(document).style.display = 'block'; }
			else { getUndoButton(doc).style.display = 'none'; }
		});

		google.maps.event.addListener(polyline, 'rightclick', function(point) {
			if (point.vertex !== null) {
				rightClickDiv.setPosition(point.latLng);
				rightClickDiv.mapCalcShow();
				rightClickDiv.open(environment.map);		

				// Move the delete button if user drags its associated vertex.  Otherwise, hide it.
				var setAtListener = google.maps.event.addListener(polyline.getPath(), 'set_at', function(newpoint) {
					if (newpoint == point.vertex) 
						rightClickDiv.setPosition(polyline.getPath().getAt(newpoint));
					else {
						rightClickDiv.mapCalcHide();
					}
				});

				// This prevents the user from right-clicking many times in succession on the same
				// vertex and thereby deleting many more than one vertex.
				google.maps.event.clearListeners(deleteButton, 'click');

				google.maps.event.addDomListener(deleteButton, 'click', function(event) {
					polyline.getPath().removeAt(point.vertex);
					rightClickDiv.mapCalcHide();
				});
				google.maps.event.addDomListener(environment.map, 'click', function() {
					rightClickDiv.mapCalcHide();
					/* If we don't clear the listener here, this is what happens:
					 *	 listener gets registered on vertex N
					 *	 vertex N is deleted
					 *	 listener still deletes vertex N on rightclick, but the number N now refers to a different vertex
					 */
					google.maps.event.clearListeners(deleteButton, 'click');
					google.maps.event.removeListener(setAtListener);
				});
			}
		});	
		return rightClickDiv;
	};

	/*
	 * @constructor
	 * @memberOf mapHelper
	 * @param {Object} pointSlope
	 * @param {Object} point1 - google.maps.LatLng
	 * @param {Object} point2 - google.maps.LatLng
	 * @param {int} slope
	 * Latitude is treated as the dependent variable (x) and longitude is independent (y).  This is 
	 * convenient because the amount of stretching in the mercator projection depends on latitude,
	 * not longitude.
	 */
	function Line(pointSlope) 
	{
		function latToLngScalingFactor(lat) {
		        var unitDistanceLat = google.maps.geometry.spherical.computeDistanceBetween(
		                new google.maps.LatLng(lat - 0.1, -87.600732),
		                new google.maps.LatLng(lat + 0.1, -87.600732)
		        );

		        var unitDistanceLng = google.maps.geometry.spherical.computeDistanceBetween(
		                new google.maps.LatLng(41.790113, -87.500732),
		                new google.maps.LatLng(41.790113, -87.700732)
		        );
		        return unitDistanceLat/unitDistanceLng;
		}

		/**
		 * Get the slope of a line. 
		 * @memberOf mapHelper.Line
		 */
		function getSlope() {
			if (pointSlope.hasOwnProperty('slope')) { return pointSlope.slope; }
			else 
			{
				var lngDelta = pointSlope.point1.lng() - pointSlope.point2.lng();
				var latDelta = pointSlope.point1.lat() - pointSlope.point2.lat();			
				return lngDelta/latDelta;
			}
		}
		this.getSlope = getSlope;

		function getIntercept() {
			return pointSlope.point1.lng() - getSlope()*pointSlope.point1.lat();
		}
		this.getIntercept = getIntercept;

		function extrapolate(latitude) {
			return new google.maps.LatLng(latitude, getSlope()*latitude + line.getIntercept());
		}
		this.extrapolate = extrapolate;

		function getPerpendicularThroughPoint(point) {
			return new Line({
				'slope': latToLngScalingFactor(point.lat())*getPerpendicularSlope(),
				'point1': point
			});
		}
		this.getPerpendicularThroughPoint = getPerpendicularThroughPoint;

		function distanceToLine(point) {
			var dlat = (pointSlope.point1.lat() - point.lat())^2;
			var dlng = (pointSlope.point1.lng() - point.lng())^2;
			return Math.sqrt(dlat + dlng);
		}
		this.distanceToLine = distanceToLine;

		function getPerpendicularSlope() { return -1/getSlope(); }
		this.getPerpendicularSlope = getPerpendicularSlope;

		function intersection(otherLine) {
			var top = getIntercept() - otherLine.getIntercept();
			var bottom = otherLine.getSlope() - getSlope();

			var lng = getSlope()*(top/bottom) + getIntercept();

			return new google.maps.LatLng(top/bottom, lng);
		}
		this.intersection = intersection;

		return this;
	}

	/** 
	 * @memberOf mapHelper
	 * @param {Object} polyline - google.maps.Polyline
	 * @param {Object} point - google.maps.LatLng
	 * @returns {google.maps.LatLng}
	 */
	function closestPointOnPolyline(polyline, point)
	{
		var path = polyline.getPath().getArray().slice(0);
		var intersections = [];
		for (var n = 0; n < path.length - 1; n++) {
			var line = new Line({'point1': path[n], 'point2': path[n+1]});
			var intersectionPoint = line.intersection(line.getPerpendicularThroughPoint(point));
			if (isBetween(path[n], path[n+1], intersectionPoint)) {
				intersections.push({
					'index': n,
					'point': intersectionPoint,
					'distance': google.maps.geometry.spherical.computeDistanceBetween(point, intersectionPoint)
				});
			}
		}
		intersections.push({
			'index': 0,
			'point': closestVertex(point, polyline),
			'distance': google.maps.geometry.spherical.computeDistanceBetween(point, closestVertex(point, polyline))

		});
		intersections.sort(function(a,b) { return a.distance - b.distance; });

		return intersections[0].point;
	}

// ----------------------------------------------------------------------------
	function isBetween(endpt1, endpt2, pt) 
// ----------------------------------------------------------------------------
	{
		var lat1 = (endpt1.lat() <= pt.lat()) && (pt.lat() <= endpt2.lat());
		var lat2 = (endpt2.lat() <= pt.lat()) && (pt.lat() <= endpt1.lat());
		var betweenLat = lat1 || lat2;

		var lng1 = (endpt1.lng() <= pt.lng() && pt.lng() <= endpt2.lng());
		var lng2 = (endpt2.lng() <= pt.lng() && pt.lng() <= endpt1.lng());
		var betweenLng = lng1 || lng2;

		return betweenLat && betweenLng;
	}

// takes a LatLng point and a polyline
// -----------------------------------------------------------------------------
	function closestVertex(point, polyline) 
// -----------------------------------------------------------------------------
	{
		var path = polyline.getPath().getArray().slice(0);
		path.sort(function(a,b) { 
			return google.maps.geometry.spherical.computeDistanceBetween(a, point) - google.maps.geometry.spherical.computeDistanceBetween(b, point);
		});
		return path[0];
	}

// ------------------------------------------------------------------------------
	function distanceAlongPolyline(polyline, lastVertex, nextPoint) 
// ------------------------------------------------------------------------------	
	{
		var partialPath = new google.maps.Polyline({
			path: polyline.getPath().getArray().slice(0, lastVertex).push(nextPoint)
		});
		return google.maps.geometry.spherical.computeLength(partialPath);
	}

// -------------------------------------------------------------------------------
	function distributeTimeStamps(polyline, startTime, endTime) 
// -------------------------------------------------------------------------------	
	{
		/* These variables remain constant, and so may safely be referenced by functions defined herein. */
		var path = polyline.getPath().getArray();
		var totalLength = google.maps.geometry.spherical.computeLength(path);
		var totalTime = getTotalTime(startTime, endTime);
		var timeDelta = 3;
		var numberOfTimestamps = Math.ceil(totalTime/timeDelta);
		var delta = totalLength/numberOfTimestamps;

		var timestampCollection = [];

		function segmentLength(i) { 
			return google.maps.geometry.spherical.computeDistanceBetween(polyline.getPath().getAt(i), polyline.getPath().getAt(i+1));
		}
		function segmentVerticalChange(i) {
			return google.maps.geometry.spherical.computeDistanceBetween(
				polyline.getPath().getAt(i), 
				new google.maps.LatLng(polyline.getPath().getAt(i + 1).lat(), polyline.getPath().getAt(i).lng())
			);			
		}

		function getSpilloverPastVertex(info) {
			if (info.currentVertex < path.length - 1) {
				var thisSegmentLength = segmentLength(info.currentVertex);
				return info.spillover + ((info.i + 1) - info.oldI)*delta - thisSegmentLength;
			}
			else return 0;
		}

		function getVerticalDistance(info) {
			var thisSegmentLength = segmentLength(info.currentVertex);
			var thisSegmentVerticalChange = segmentVerticalChange(info.currentVertex);
			var verticalDelta = delta*thisSegmentVerticalChange/thisSegmentLength;

			info.verticalDistance = verticalDelta;
			while ( getSpilloverPastVertex(info) > 0 ) {
				info.spillover = getSpilloverPastVertex(info);
				info.currentVertex += 1;
				var verticalSpillover = 0;

				if (info.currentVertex < path.length - 1) {
					var nextSegmentLength = segmentLength(info.currentVertex);
					var nextSegmentVerticalChange = segmentVerticalChange(info.currentVertex);

					verticalSpillover = info.spillover*nextSegmentVerticalChange/nextSegmentLength;
				}

				info.basePoint = polyline.getPath().getAt(info.currentVertex);
				info.oldI = info.i + 1;
				info.verticalDistance = verticalSpillover;
			}
			return info;
		}

		var thisTimestampInfo = {
			'basePoint': polyline.getPath().getAt(0),
			'i': 0,
			'currentVertex': 0,
			'spillover': 0,
			'oldI': 0,
			'verticalSpillover': 0
		};
		var timestamp = spatialsurvey(environment.map, doc).timestamp({
			polyline: polyline, 
			position: closestPointOnPolyline(polyline, thisTimestampInfo.basePoint), 
			startTime: startTime,
			endTime: endTime			
		});	
		timestamp.create();
		timestampCollection.push(timestamp);

		for (var i = 0; i < numberOfTimestamps; i++) {
			thisTimestampInfo = getVerticalDistance(thisTimestampInfo);
	
			if (thisTimestampInfo.currentVertex < path.length - 1) {
				var endpoint1 = polyline.getPath().getAt(thisTimestampInfo.currentVertex);
				var endpoint2 = polyline.getPath().getAt(thisTimestampInfo.currentVertex + 1);
				var line = new Line({
					'point1': endpoint1, 
					'point2': endpoint2
				});

				thisTimestampInfo.basePoint = line.extrapolate(thisTimestampInfo.basePoint.lat() + Math.sgn(endpoint2.lat() - endpoint1.lat())*thisTimestampInfo.verticalDistance*metersToLat(thisTimestampInfo.basePoint));	
			}

			
			if (i == numberOfTimestamps - 1) { // last timestamp 
				timestamp = spatialsurvey(environment.map, doc).timestamp(polyline, thisTimestampInfo.basePoint, endTime, false);
				timestamp.create();
				timestampCollection.push(timestamp);
			}
			else {
				timestamp = spatialsurvey(environment.map, doc).timestamp(polyline, thisTimestampInfo.basePoint, incrementTimestamp(startTime, timeDelta*(i+1)), false);
				timestamp.create();
				timestampCollection.push(timestamp);
			}
			thisTimestampInfo.i++;
		}
		return timestampCollection;
	}

	/** 
	 * Convert pixel coordinates to geographic coordinates.
	 * @memberOf mapHelper
	 * @param {float} x
	 * @param {float} y
	 * @returns {google.maps.LatLng}
	 */
	function pixelsToLatLng(x,y) {
		var overlay = new google.maps.OverlayView();
		overlay.draw = function() {};
		overlay.setMap(environment.map);		
		var proj = overlay.getProjection();
		return proj.fromDivPixelToLatLng(new google.maps.Point(x, y));
	}

	/** 
	 * Convert google.maps objects to geoJSON.
	 * @memberOf mapHelper
	 * @param {Object} geodata - google.maps.LatLng or google.maps.Polyline
	 * @returns {GeoJSON}
	 */
	function toGeoJSON(geodata) {
		var type = null;
		var geoJSON = {};
		/* geodata is a google.maps.LatLng object. */
		if ( typeof geodata.lat === 'function' ) {
			type = 'LatLng';
			geoJSON = {
				"type": "Point", 
				"coordinates": [ geodata.lng(), geodata.lat() ]
			};
		}
		/* geodata is a google.maps.Polygon object. */
		else if ( typeof geodata.getPaths === 'function' ) {
			type = 'Polygon';
			var polygonCoordinates = [];
			var polygonSize = geodata.getPath().getArray().length;
			if ( polygonSize < 4 )
				throw "A geoJSON Polygon must be a LinearRing with four or more vertices.";
			geoJSON = {
				"type": "Polygon",
				"coordinates": toGeoJSON(new google.maps.Polyline({ path: polygonCoordinates })).coordinates
			};
		}
		/* geodata is a google.maps.Polyline object. */
		else if ( typeof geodata.getPath === 'function' ) {
			type = 'Polyline';
			var polylineCoordinates = [];
			var polylineLength = geodata.getPath().getArray().length;
			for (var i = 0; i < polylineLength; i++) {
				polylineCoordinates.push([geodata.getPath().getAt(i).lng(), geodata.getPath().getAt(i).lat()]);
			}
			geoJSON = {
				"type": "LineString",
				"coordinates": polylineCoordinates
			};
		}
		return geoJSON;
	}

	/** 
	 * @memberOf mapHelper
	 * @param {GeoJSON}
	 * @returns {Object} - Returns google.maps.Point or google.maps.Polyline object.
	 */
	function fromGeoJSON(geojson) {
		if ( typeof geojson.type === 'undefined')
			throw "Incorrect geoJSON syntax.  Object has no \"type\" attribute.";
		else {
			if ( geojson.type === "Point" ) {
				return new google.maps.LatLng(geojson.coordinates[1], geojson.coordinates[0]);
			}
			else if ( geojson.type === "LineString") {
				var polylinePath = [];
				for (var i = 0; i < geojson.coordinates.length; i++) 
					polylinePath.push(new google.maps.LatLng(geojson.coordinates[i][1], geojson.coordinates[i][0]));

				return new google.maps.Polyline({
					path: polylinePath,
					strokeColor: '#4387fd',
					strokeWeight: 4,
					clickable: false					
				});
			}
			else {
				throw "mapHelper.fromGeoJSON() cannot yet convert this type of GeoJSON.";
			}
		}
	}

	// public methods and constructors
	return {
		'closestPointOnPolyline': closestPointOnPolyline, 
		'rightClickButton': rightClickButton,
		'placeMarker': placeMarker,
		'distributeTimeStamps': distributeTimeStamps,
		'pixelsToLatLng': pixelsToLatLng,
		'Line': Line,
		'init': init,
		'toGeoJSON': toGeoJSON,
		'fromGeoJSON': fromGeoJSON
	};

}());

function metersToLat(point) {
	var latDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat() + 1, point.lng())
	);
	return 1/latDistance;
}

function metersToLng(point) {
	var lngDistance = google.maps.geometry.spherical.computeDistanceBetween(
		point,
		new google.maps.LatLng(point.lat(), point.lng() + 1)
	);
	return 1/lngDistance;
}

function getTotalTime(startTimeString, endTimeString) 
{
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
	var startParsed = regex.exec(startTimeString);
	console.log(startParsed);
	var startHour = startParsed[1];
	var startMinute = typeof startParsed[2] === 'undefined' ? 0 : startParsed[2];
	var startTime = parseInt(startHour, 10) + (startMinute/60);

	// if ( /^P.?M.?$/i.test(startParsed[3]) ) 
	// 	endTime += 12;	

	var endParsed = regex.exec(endTimeString);
	var endHour = parseInt(endParsed[1], 10);
	var endMinute = typeof endParsed[2] === 'undefined' ? 0 : endParsed[2];
	var endTime = endHour + (endMinute/60);

	if ( /^P.?M.?$/i.test(endParsed[3]) && endHour != 12 ) 
		endTime += 12; 
	else if ( /^A.?M.?$/i.test(endParsed[3]) && endHour != 12 )
		endTime += 24;
	else if ( /^A.?M.?$/i.test(endParsed[3]) && endHour == 12 )
		endTime += 12;

	return endTime - startTime;
}

function incrementTimestamp(baseTimeString, timeDifference) {
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;

	var baseParsed = regex.exec(baseTimeString);
	var baseHour = parseInt(baseParsed[1], 10);
	var baseMinute = typeof baseParsed[2] === 'undefined' ? 0 : baseParsed[2];

	var newTime = new Date();

	newTime.setHours(parseInt(baseParsed[1], 10) + Math.floor(timeDifference));
	newTime.setMinutes(baseMinute + 60*(timeDifference - Math.floor(timeDifference)));

	var newHour = newTime.getHours();
	var period = newHour >= 12 ? ' pm' : ' am';

	var newHourString = String(newHour) % 12 === 0 ? 12 : String(newHour % 12);

	var newMinuteString = newTime.getMinutes() === 0 ? '' : ':' + String(padInteger(newTime.getMinutes(),2));

	var newTimeString = newHourString + newMinuteString + period;

	return newTimeString;
}

function timestringToInteger(timeString) {
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
	var parsed = regex.exec(timeString);

	var hour = parseInt(parsed[1], 10) % 24;
	var minute = typeof parsed[2] === 'undefined' ? 0 : parseInt(parsed[2], 10)/60;

	if ( /^P.?M.?$/i.test(parsed[3]) && hour != 12) 
		hour += 12; 
	if ( /^A.?M.?$/i.test(parsed[3]) && hour == 12 )
		hour = 0;

	return hour + minute;
}

function padInteger(num, length) {

    return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}

function getCSSRule(ruleName, deleteFlag) {               // Return requested style obejct
   ruleName=ruleName.toLowerCase();                       // Convert test string to lower case.
   if (document.styleSheets) {                            // If browser can play with stylesheets
      for (var i=0; i<document.styleSheets.length; i++) { // For each stylesheet
         var styleSheet=document.styleSheets[i];          // Get the current Stylesheet
         var ii=0;                                        // Initialize subCounter.
         var cssRule=false;                               // Initialize cssRule. 
         do {                                             // For each rule in stylesheet
            if (styleSheet.cssRules) {                    // Browser uses cssRules?
               cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
            } else {                                      // Browser usses rules?
               cssRule = styleSheet.rules[ii];            // Yes IE style. 
            }                                             // End IE check.
            if (cssRule)  {                               // If we found a rule...
               if (cssRule.selectorText.toLowerCase()==ruleName) { //  match ruleName?
                  if (deleteFlag=='delete') {             // Yes.  Are we deleteing?
                     if (styleSheet.cssRules) {           // Yes, deleting...
                        styleSheet.deleteRule(ii);        // Delete rule, Moz Style
                     } else {                             // Still deleting.
                        styleSheet.removeRule(ii);        // Delete rule IE style.
                     }                                    // End IE check.
                     return true;                         // return true, class deleted.
                  } else {                                // found and not deleting.
                     return cssRule;                      // return the style object.
                  }                                       // End delete Check
               }                                          // End found rule name
            }                                             // end found cssRule
            ii++;                                         // Increment sub-counter
         } while (cssRule);                               // end While loop
      }                                                   // end For loop
   }                                                      // end styleSheet ability check
   return false;                                          // we found NOTHING!
}                                                         // end getCSSRule 
