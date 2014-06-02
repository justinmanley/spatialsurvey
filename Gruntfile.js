module.exports = function(grunt) {
	var forDocumentation = ['core.js', 'README.md', 'package.json'];

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		clean: {
			docs: ['docs']
		},
		jshint: {
			options: {
				'smarttabs': true
			},
			all: ['Gruntfile.js', 'core.js']
		},
		less: {
			development: {
				files: { 'css/style.css': 'css/style.less' }
			}
		},		
		qunit: {
			files: [ 'tests/*.html' ]
		},
		watch: {
			less: {
				files: [ 'css/style.less' ],
				tasks: [ 'less' ]
			},
			jsdoc: {
				files: forDocumentation,
				tasks: ['jsdoc']
			},
			jshint: {
				files: [ 'core.js' ],
				tasks: [ 'jshint' ]
			},
			qunit: {
				files: [ 'core.js', 'tests/*' ],
				tasks: [ 'qunit']
			}
		},
		jsdoc: {
			dist: {
				src: forDocumentation,
				options: {
					destination: 'docs',
					configure: 'jsdoc.conf.json',
					template: 'node_modules/ink-docstrap/template'
				},
				jsdoc: '/usr/bin/jsdoc'
			}
		}		
	});
	grunt.registerTask('default', ['jshint', 'clean:docs', 'jsdoc', 'less']);
	grunt.registerTask('work', 'watch');	
	grunt.registerTask('test', ['qunit']);
	grunt.registerTask('lint', ['jshint']);
};