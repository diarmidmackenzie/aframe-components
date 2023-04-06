QUnit.module('add', function() {
  QUnit.test('two numbers', function(assert) {
    assert.equal(add(1, 2), 3);
  });
});
