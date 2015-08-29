'use strict';

module.exports.create = function(Sync) {
  var Test = {};

  Test.merge = function() {
    let remoteData = [{
      _id: '1',
      _revision: '1_a',
      _revisions: [{
        _revision: '1_a',
        data: {'hello': 'world'}
      }]
    }];
    let localData = [{
      _id: '2',
      _revision: '1_b',
      _remoteRevision: null,
      data: {'some': 'other data'}
    }];
    let merged = Sync.merge(remoteData, localData);
    console.log(merged);
  };

  Test.run = function() {
    Test.merge();
  };

  return Test;
};
