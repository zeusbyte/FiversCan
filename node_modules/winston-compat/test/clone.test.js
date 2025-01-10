'use strict';

var assume = require('assume'),
    compat = require('../');

describe('clone()', function () {
  it('clone(Error)', function () {
    var original = new Error("foo"),
        copy;

    original.name = "bar";
    copy = compat.clone(original);
    assume(original).not.equals(copy);
    assume(original.message).equals(copy.message);
    assume(original.name).equals(copy.name);
  });

  it('clone(Date)', function () {
    var original = new Date(1000);
    var copy = compat.clone(original);

    assume(original).not.equals(copy);
    assume(original.getTime()).equals(copy.getTime());
  });
});
