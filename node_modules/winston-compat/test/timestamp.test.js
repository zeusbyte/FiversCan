'use strict';

var assume = require('assume'),
    compat = require('../');

describe('timestamp()', function () {
  it('creates an ISO string', function () {
    var timestamp = compat.timestamp();
    var date = new Date(timestamp);

    assume(date).is.a('date');
    assume(date.toISOString()).equals(timestamp);
  });
});
