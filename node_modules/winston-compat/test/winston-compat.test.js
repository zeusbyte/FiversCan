'use strict';

var assume = require('assume'),
    compat = require('../');

describe('winston-compat', function () {
  it("require('winston-compat/test/helpers.js')", function () {
    assume(function () {
      var helpers = require('./helpers');
    }).does.not.throw()
  });

  it("require('winston-compat/test/transports/transport')", function () {
    assume(function () {
      var transport = require('./transports/transport');
    }).does.not.throw()
  });
});
