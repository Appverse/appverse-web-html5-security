'use strict';

// Configure protractor to run e2e tests on 'dist' code

var settings = require('./common/protractor.conf');

settings.specs = [
    '../../test/e2e/**/*.js',
];

// Enable PhantomJS testing here.
// Its seems that there are no random failures when testing with
// non instrumented code
// TODO: remove Phantomjs and use real browsers with Vagrant
settings.capabilities = {
    browserName: 'phantomjs',
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.cli.args': ['--ignore-ssl-errors=true', '--web-security=false']
};

settings.baseUrl = 'http://localhost:9090/';

exports.config = settings;
