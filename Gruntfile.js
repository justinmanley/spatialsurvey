module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		jsdoc: {
			dist: {
				src: ['core.js'],
				options: {
					destination: 'docs'
				},
				jsdoc: '/usr/bin/jsdoc'
			}
		},
		jshint: {
			options: {
				"smarttabs": true
			},
			all: ['Gruntfile.js', 'core.js']
		},
		qunit: {
			files: [ 'tests/*.html' ]
		},
		less: {
			development: {
				options: {
					rootpath: 'css',
					files: { 'style.css': 'style.less' }
				}
			}
		},
		watch: {
			less: {
				files: [ 'style.less' ],
				tasks: [ 'less' ]
			}
		}
	});
	grunt.registerTask('default', ['jsdoc', 'less', 'jshint']);
	grunt.registerTask('test', ['qunit']);
	grunt.registerTask('lint', ['jshint']);
};