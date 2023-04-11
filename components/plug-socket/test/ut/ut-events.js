QUnit.module('events mode tests', function() {

  QUnit.test('plug connects to nearby socket', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0'
     }
    simplePlugSocketTest(assert, options)
  });
  
});
