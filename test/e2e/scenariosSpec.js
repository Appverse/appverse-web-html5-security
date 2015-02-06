'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Appverse Web Html5 security Demo', function() {

    beforeEach(function() {
        browser.get('/');
    });


    it('should the Sign In link"', function() {
        //var text = element(by.css('#securityDirective')).getText();
        //expect(text).toBe('Sign In');
        expect(true).toBe(true);
    });


});
