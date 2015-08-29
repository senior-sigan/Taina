'use strict';

module.exports.create = function(Sync) {
  var Test = {};

  Test.merge = function() {
    let remoteData = [{
      _id: '1r',
      _revision: '1_a',
      _revisions: [{
        _revision: '1_a',
        data: {'hello': 'world'}
      }]
    }, {
      _id: '2r',
      _revision: '1_aa',
      _revisions: [{
        _revision: '1_aa',
        data: {'hello': 'world'}
      }]
    }, {
      _id: '3r',
      _revision: '1_aaa_new',
      _revisions: [{
        _revision: '1_aaa',
        data: {'hello': 'world'}
      }, {
        _revision: '1_aaa_new',
        data: {'hello': 'merge'}
      }]
    }];
    let localData = [{
      _id: '1l',
      _revision: '1_b',
      _remoteRevision: null,
      data: {'some': 'other data'}
    }, {
      _id: '2r',
      _revision: '1_aab',
      _remoteRevision: '1_aa',
      data: {'hello': 'new world'}
    }, {
      _id: '3r',
      _revision: '1_aaab',
      _remoteRevision: '1_aaa',
      data: {'hello': 'difficult merge'}
    }];
    let merged = Sync.merge(remoteData, localData);
    console.log(merged);
  };

  Test.run = function() {
    Test.merge();
  };

  return Test;
};
