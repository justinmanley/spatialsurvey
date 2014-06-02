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
			for ( var key in parsedData ) {
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
			for ( var key in data ) {
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

			for ( var key in data ) {
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
		throw "Error: SurveyResponse.toGeoJSON has not been implemented.\nThe application developer should implement this function.";
	};

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
	 * @constructor
	 * @memberOf spatialsurvey
	 */
	function UIComponent() {
		var that = this,
			data = {};

		/** 
		 * @memberOf spatialsurvey.UIComponent
		 * @param {Object} defaults
		 * @returns {UIComponent}
		 */
		function setDefaults(defaults) {
			for ( var def in defaults) {
				if ( defaults.hasOwnProperty(def) )
					data[def] = defaults[def];
			}
			return that;
		}
		this.setDefaults = setDefaults;


		/** 
		 * @memberOf spatialsurvey.UIComponent
		 * @param {Object} options
		 * @returns {UIComponent}
		 */
		function setOptions(options) {
			for ( var option in options) {
				if ( options.hasOwnProperty(option))
					data[option] = options[option];
			}
			return that;
		}
		this.setOptions = setOptions;

		/** 
		 * @memberOf spatialsurvey.UIComponent
		 * @param {string} name
		 * @returns {Object}
		 */
		function get(name) {
			return data[name];
		}
		this.get = get;

		/** 
		 * @memberOf spatialsurvey.UIComponent
		 * @param {string} name
		 * @param {Object{ value
		 * @returns {UIComponent}
		 */
		function set(name, value) {
			if ( typeof name === 'string' )
				data[name] = value;
			else
				throw "Spatialsurvey: TypeError.  Correct usage is UIComponent.set(name, value).";

			return that;
		}
		this.set = set;
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
		UIComponent.call(this);
		this.setOptions(opt);

		var button = document.createElement('button');
		button.id = this.get('id');
		button.setAttribute('class', 'dowsing-button');
		button.innerHTML = this.get('text');
		
		/** 
		 * Adds the button to the bottom center control position on the map. 
		 * @memberOf spatialsurvey.Button
		 */
		this.show = function() {
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(button);			
		};

		google.maps.event.addDomListener(button, 'click', this.get('onClick'));
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
		UIComponent.call(this);
		this.setDefaults({
			polyline: new google.maps.Polyline({}),
			position: new google.maps.LatLng({}),
			startTime: '',
			endTime: '',
			type: 'duration'
		}).setOptions(options);

		var that = this,
			openedContent = timestampOpenedContent(),
			closedContent = timestampClosedContent(),
			timestamp = {
				opened: new InfoBox({
					content: openedContent.content,
					position: that.get('position'),
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
					position: that.get('position'),
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
					position: that.get('position')
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
				if ( isValidTime(startTime) && ( isValidTime(endTime) || this.get('type') === 'single' ) ) {
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

		function timestampOpenedContent() {
			var info = document.createElement('div');
			info.setAttribute('class', 'timestamp-opened timestamp-container');


			info.innerHTML = '<form class="timestamp-form" onclick="false">'+
					'<label class="timestamp-label" for="time">Time</label>'+
					'<br />'+
					'<fieldset class="timestamp-data">'+
						'<input type="text" name="start-time" class="timestamp" value="' + that.get('startTime') + '"/>'+
						'<input type="text" name="end-time" class="timestamp" value="' + that.get('endTime') + '"/>'+
						'<input type="hidden" name="position-lat" class="timestamp-position-lat" value="' + that.get('position').lat() + '"/>'+
						'<input type="hidden" name="position-lng" class="timestamp-position-lng" value="' + that.get('position').lng() + '"/>'+
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

		function timestampClosedContent() {
			var placeholder = document.createElement('div');
			var separator = that.get('type') === 'double' ? ' - ' : '';

			placeholder.setAttribute('class', 'timestamp-closed timestamp-container');
			placeholder.innerHTML = '<form class="timestamp-form">'+
					'<label for="start-time" class="timestamp-label">' + that.get('startTime') + '</label>'+
					separator+
					'<input type="hidden" name="start-time" class="timestamp" value="' + that.get('startTime') + '"/>'+	
					'<label for="end-time" class="timestamp-label">' + that.get('endTime') + '</label>'+							
					'<input type="hidden" name="end-time" class="timestamp" value="' + that.get('endTime') + '"/>'+				
					'<input type="hidden" name="position-lat" class="timestamp-position-lat" value="' + that.get('position').lat() + '"/>'+
					'<input type="hidden" name="position-lng" class="timestamp-position-lng" value="' + that.get('position').lng() + '"/>'+
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
		UIComponent.call(this);
		this.setDefaults({ 
			content: [''], 
			action: function() { },
			hideAction: function() { }
		}).setOptions(options);

		var that = this,
			extra = document.createElement('div');
		extra.id = 'extra';
		extra.innerHTML = '<div id="instructions-main">'+
			'<div class="close-box">'+
				'<img src="' + getResourceUrl('close-icon.png') + '"/>'+
			'</div>'+				
			'<div id="instructions-main-content">'+
			'</div><!-- #instructions-main-content -->'+
			'<button class="dowsing-button" id="next-instruction">Next</button>'+				
			'</div><!-- #instructions-main -->';
		document.getElementsByTagName('body')[0].appendChild(extra);
		document.getElementById('instructions-main').style.display = 'none';				
		
		/** 
		 * Displays the main instructions panel.
		 * @memberOf spatialsurvey.Instructions
		 */
		function show() {
			// if user defines hideAction, this allows primary and action to toggle back and forth
			that.get('hideAction')();

			var primary = document.getElementById('instructions-main');
			var primary_content = document.getElementById('instructions-main-content');

			primary.style.display = 'block';

			// initialize instructions_main screen
		    var primary_screen_index = 0;
		    var content = that.get('content');
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

			that.get('action')();
		}
		this.hide = hide;
		return this;
	}

	/** 
	 * @constructor
	 * @memberOf spatialsurvey
	 * @param {Object} options
	 * @param {string} options.content
	 * @param {int} options.height
	 * @param {string} options.sidebarId
	 * @param {Object} options.help
	 * @param {string} options.content
	 * @param {string} options.teaser
	 * @param {string} options.contentId
	 * @param {string} options.teaserId
	 */
	function Sidebar(options) {
		UIComponent.call(this);
		this.setDefaults({
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
		}).setOptions(options);

		var that = this,
			sidebar = document.createElement('div'),
			help = document.createElement('div');

		sidebar.id = this.get('sidebarId');
		sidebar.innerHTML = this.get('content');
		sidebar.style.height = this.get('height');		
		helpContent = document.createElement('div'),
		helpTeaser = document.createElement('p');
		help.id = 'help-panel';
		helpContent.id = this.get('help').contentId;
		helpTeaser.id = this.get('help').teaserId;
		helpContent.innerHTML = this.get('help').content;
		helpTeaser.innerHTML = this.get('help').teaser;

		sidebar.appendChild(helpTeaser);
		sidebar.appendChild(helpContent);

		var show = function() {
			sidebar.style.display = 'block';	

			environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
			environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(sidebar);					
		};
		this.show = show;

		var hide = function() {
			sidebar.style.display = 'none';			
		};
		this.hide = hide;

		var toggleHelp = function() {
			var sidebar = document.getElementById(that.get('sidebarId'));
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
		this.toggleHelp = toggleHelp;

		function refresh(action) {
			action();
			var thisSidebar = document.getElementById('instructions-sidebar');
			environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
			environment.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(thisSidebar);									
		}
		this.refresh = refresh;

		return this;
	}

	/**
	 * @constructor
	 * @memberOf spatialsurvey
	 * @param {Object} options
	 * @param {int} options.currentScreen
	 * @param {int} options.max
	 * @param {string} options.description
	 */
	function ProgressBar(options) {
		UIComponent.call(this);
		this.setOptions(options);
		var that = this,
			progressBar = document.createElement('div'),
			progressIndicator = document.createElement('div'),
			progressText = document.createElement('div'),
			widthFormat = /^([0-9]*)px$/;

		progressBar.id = 'progress-bar';
		progressIndicator.id = 'progress-indicator';
		progressText.id = 'progress-text';

		var progressBarWidth = parseInt(widthFormat.exec(getCSSRule('#progress-bar').style.width)[1], 10);

		progressIndicator.style.width = (this.get('currentScreen')/this.get('max'))*progressBarWidth + 'px';

		progressText.innerHTML = this.get('currentScreen') + ' : ' + this.get('description');

		progressBar.appendChild(progressIndicator);
		progressBar.appendChild(progressText);

		function show() {
			environment.map.controls[google.maps.ControlPosition.TOP_CENTER].push(progressBar);
			return that;				
		}
		this.show = show;

		return this;
	}

	/** 
	 * @constructor
	 * @memberOf spatialsurvey
	 */
	function Tutorial(lessons) {
		// initialize the tutorialBox DOM element
		var tutorialBox = document.createElement('div'),
			tutorialText = document.createElement('div'),
			button = document.createElement('button');

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

		var TUTORIAL_START = 0;

		infoBoxManager.init('interactive');

		document.addEventListener("lessoncomplete", function(event) {
			if ( event.detail.lessonIndex + 1 < lessons.length )
				startLesson(event.detail.lessonIndex + 1, event.detail.data);
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

		/** 
		 * @memberOf spatialsurvey.Tutorial
		 */
		function start() {
			startLesson(TUTORIAL_START);
		}
		this.start = start;

		/** 
		 * @memberOf spatialsurvey.Tutorial
		 * @param {Object} options
		 * @param {int} options.width
		 * @param {string} options.content
		 * @param {string} [options.buttonText]
		 * @param {bool} options.hasButton
		 */
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
					Tutorial.completeLesson();
				});
			}
			environment.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(tutorialBox);				
		}
		this.fixedTutorialBox = fixedTutorialBox;

		/** 
		 * @memberOf spatialsurvey.Tutorial
		 * @param {Object} options
		 * @param {function} options.getPosition
		 * @param {int} options.width
		 * @param {string} options.content
		 * @param {int} options.pixelOffset
		 */
		function interactiveTutorialBox(options) {
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
		this.interactiveTutorialBox = interactiveTutorialBox;

		/** 
		 * @memberOf spatialsurvey.Tutorial
		 * @param {int} lessonIndex
		 * @param {Object} data
		 */
		function startLesson(lessonIndex, data) {
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
			for ( var option in lessons[lessonIndex] ) {
				if ( lessons[lessonIndex].hasOwnProperty(option) )
					thisLesson[option] = lessons[lessonIndex][option];
			}

			if ( thisLesson.fixed )
				fixedTutorialBox(thisLesson.instruction);
			else 
				interactiveTutorialBox(thisLesson.instruction);				

			thisLesson.advance(data || {});
		}
		this.startLesson = startLesson;

		return this;
	}

	/** 
	 * @memberOf spatialsurvey.Tutorial
	 * @param {Object} data
	 * @static
	 */
	Tutorial.completeLesson = (function() {
		var lessonCounter = 0;
		return function(options) {
			if ( typeof options === 'undefined' )
				options = {};
			if ( typeof options.lessonIndex !== 'undefined' )
				lessonCounter = options.lessonIndex;

			var lessonComplete = new CustomEvent("lessoncomplete", {
				detail: {
					'lessonIndex': lessonCounter,
					'data': options.data
				}
			});
			document.dispatchEvent(lessonComplete);
			lessonCounter++;
		};
	}());

	var standardTutorialLessons = [
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
					Tutorial.completeLesson();
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

						debug('at least three points in polyline');
						Tutorial.completeLesson({ data: { 'position': proj.fromPointToLatLng(browserPoint) }});
						document.removeEventListener('clicknodrag', onThirdPoint);	
					} 
					else 
						points++;
				}
				document.addEventListener('clicknodrag', onThirdPoint);

				var prematurePolylineComplete = google.maps.event.addListener(environment.drawingManager, 'polylinecomplete', function(polyline) {
					var numberOfVertices = polyline.getPath().getArray().length;
					var verticesString = numberOfVertices == 1 ? 'vertex' : 'vertices';
					if ( numberOfVertices < 3 ) {
						document.removeEventListener('clicknodrag', onThirdPoint);								
						google.maps.event.removeListener(prematurePolylineComplete);

						var errorMessage = 'You created a line with only ' + numberOfVertices + ' ' + verticesString + ', probably because you clicked twice on the same point.<br />To draw a line, single-click along your desired path to place vertices on the map.';
						error.report(errorMessage, function() { 
							polyline.setMap(null);
							environment.drawingManager.setOptions({ drawingMode: google.maps.drawing.OverlayType.POLYLINE});
							startLesson(0);
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
			advance: function(data) { 
				var onCompletePolyline = google.maps.event.addListener(environment.drawingManager, 'polylinecomplete', function(polyline) {
					environment.drawingManager.setOptions({ drawingMode: null });
					mapHelper.enableVertexDelete(polyline);

					console.log('path is completed');
					Tutorial.completeLesson({ data: { 'polyline': polyline }});
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
			advance: function(data) {
				console.log(data);
				var polyline = data.polyline;
				editPolyline = 0;

				function onEditPolyline() {
					editPolyline += 1;
					if ( editPolyline == 1 ) { 
						Tutorial.completeLesson({ 'data': data });
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
			advance: function(data) {
				var polyline = data.polyline;

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
					Tutorial.completeLesson({ 'data': data});
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
			advance: function(data) {
				var polyline = data.polyline;

				var deleteListener = google.maps.event.addListener(polyline.getPath(), 'remove_at', function() {
					Tutorial.completeLesson({'data': data});
					google.maps.event.removeListener(deleteListener);					
				});
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
	}															// end getCSSRule

	// public methods and constructors for module spatialsurvey
	return {
		'SurveyResponse': SurveyResponse,
		'Button': Button,
		'Timestamp': Timestamp,
		'Instructions': Instructions,
		'UIComponent': UIComponent,
		'Sidebar': Sidebar,
		'ProgressBar': ProgressBar,	
		'Tutorial': Tutorial,
		'standardTutorialLessons': standardTutorialLessons,
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
			enableVertexDelete(polyline);
		});
	}

	function comparePoints(a, b) {
		if (google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord) < google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord)) 
			return -1;
		if (google.maps.geometry.spherical.computeDistanceBetween(b.point, b.coord) < google.maps.geometry.spherical.computeDistanceBetween(a.point, a.coord))
			return 1;
		else
			return 0;
	}

	function placeMarker(point) {
		var marker = new google.maps.Marker({
			position: point,
			map: environment.map
		});
		return marker;
	}

	var validDeleteUrl = false;

	function getDeleteUrl() {
		var deleteUrl = 'http://i.imgur.com/RUrKV.png';
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

	function getUndoButton(doc) {
		var images = document.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == 'https://maps.gstatic.com/mapfiles/undo_poly.png')
				return images[i];
		}
		return -1;
	}

	function getDeleteButton(doc) {
		var images = document.getElementsByTagName('img');
		for (var i = 0; i < images.length; i++) {
			console.log(images[i].src);
			if (images[i].src == getDeleteUrl())
				return images[i];
		}
		return -1;
	}

	function addDeleteButton(doc, polyline) {
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

	}

	/** 
	 * @memberOf mapHelper
	 * @param {google.maps.Polyline} polyline
	 */
	var enableVertexDelete = function(polyline)
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

	/**
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

	function closestVertex(point, polyline) {
		var path = polyline.getPath().getArray().slice(0);
		path.sort(function(a,b) { 
			return google.maps.geometry.spherical.computeDistanceBetween(a, point) - google.maps.geometry.spherical.computeDistanceBetween(b, point);
		});
		return path[0];
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
		'enableVertexDelete': enableVertexDelete,
		'placeMarker': placeMarker,
		'pixelsToLatLng': pixelsToLatLng,
		'Line': Line,
		'init': init,
		'toGeoJSON': toGeoJSON,
		'fromGeoJSON': fromGeoJSON
	};

}());