module.exports = function(grunt) {
	var forDocumentation = ['core.js', 'README.md', 'package.json'];

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		clean: {
			docs: ['docs']
		},
		jsdoc: {
			dist: {
				src: forDocumentation,
				options: {
					destination: 'docs'
				},
				jsdoc: '/usr/bin/jsdoc'
			}
		},
		jshint: {
			options: {
				'smarttabs': true
			},
			all: ['Gruntfile.js', 'core.js']
		},
		less: {
			development: {
				options: {
					rootpath: 'css',
					files: { 'style.css': 'style.less' }
				}
			}
		},		
		qunit: {
			files: [ 'tests/*.html' ]
		},
		watch: {
			less: {
				files: [ 'style.less' ],
				tasks: [ 'less' ]
			},
			jsdoc: {
				files: forDocumentation,
				tasks: ['jsdoc']
			}
		}
	});
	grunt.registerTask('default', ['clean:docs', 'jsdoc', 'less', 'jshint']);
	grunt.registerTask('watch', ['watch']);	
	grunt.registerTask('test', ['qunit']);
	grunt.registerTask('lint', ['jshint']);
};