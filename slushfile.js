/*
 * slush-neat
 * https://github.com/dtasic/slush-neat
 *
 * Copyright (c) 2016, Dejan Tasic
 * Licensed under the MIT license.
 */

'use strict';
var gulp = require('gulp'),
gutil = require('gulp-util'),
install = require('gulp-install'),
conflict = require('gulp-conflict'),
template = require('gulp-template'),
rename = require('gulp-rename'),
_ = require('underscore.string'),
inquirer = require('inquirer'),
fs = require('fs'),
path = require('path'),
wiredep = require('wiredep');

function format(string) {
var username = string.toLowerCase();
return username.replace(/\s/g, '');
}
var defaults = (function() {
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
workingDirName = process.cwd().split('/').pop().split('\\').pop(),
osUserName = homeDir && homeDir.split('/').pop() || 'root',
configFile = homeDir + '/.gitconfig',
user = {};
if (require('fs').existsSync(configFile)) {
user = require('iniparser').parseSync(configFile).user;
}
return {
appName: workingDirName,
userName: format(user.name) || osUserName,
authorEmail: user.email || ''
};
})();


gulp.task('default', function(done) {
	gutil.log('Scaffolding Gulp Bower Bourbon Neat for your web app.');
		var prompts = [{
			name: 'appName',
			message: 'What is the name of project?',
			default: defaults.appName
		},
		{
			name: 'projectDesc',
			message: 'Project description?',
			default: ''
		},
		{
			name: 'authorName',
			message: 'What is the name of author?',
			default: defaults.userName
		},
		{
			name: 'authorEmail',
			message: 'Author e-mail?',
			default: ''
		}];
		//Ask
		inquirer.prompt(prompts, function(answers) {
			answers.appNameSlug = _.slugify(answers.appName);
			gulp.src(__dirname + '/templates/**')
			.pipe(template(answers))
			.pipe(rename(function(file) {
			if (file.basename[0] === '_') {
				file.basename = '.' + file.basename.slice(1);
			}
		}))
		.pipe(conflict('./'))
		.pipe(gulp.dest('./'))
		.pipe(install())
		.on('end', function() {
			done();
		});
        process.on('exit', function () {
                var skipInstall = process.argv.slice(2).indexOf('--skip-install') >= 0;

                if (!skipInstall) {



                        var bowerJson = JSON.parse(fs.readFileSync('./bower.json'));

                        // wire Bower packages to .html
                        wiredep({
                                bowerJson: bowerJson,
                                directory: 'app/bower_components',
                                src: 'app/index.html'
                        });


                                // wire Bower packages to .scss
                                wiredep({
                                        bowerJson: bowerJson,
                                        directory: 'app/bower_components',
                                        src: 'app/scss/*.scss'
                                });

                } else {
                        gutil.log('After running `npm install & bower install`, inject your front end dependencies into');
                        gutil.log('your HTML by running:');
                        gutil.log('  gulp wiredep');
                }
               });
			});
		});
