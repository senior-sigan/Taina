module.exports.create = function(Sync) {
  const Test = {};

  Test.merge = function() {
    const remoteData = [{
      _id: '1r',
      revision: '1_a',
      revisions: [{
        revision: '1_a',
        data: {'hello': 'world'},
      }],
    }, {
      _id: '2r',
      revision: '1_aa',
      revisions: [{
        revision: '1_aa',
        data: {'hello': 'world'},
      }],
    }, {
      _id: '3r',
      revision: '1_aaa_new',
      revisions: [{
        revision: '1_aaa',
        data: {'hello': 'world'},
      }, {
        revision: '1_aaa_new',
        data: {'hello': 'merge'},
      }],
    }];
    const localData = [{
      _id: '1l',
      revision: '1_b',
      remoteRevision: null,
      data: {'some': 'other data'},
    }, {
      _id: '2r',
      revision: '1_aab',
      remoteRevision: '1_aa',
      data: {'hello': 'new world'},
    }, {
      _id: '3r',
      revision: '1_aaab',
      remoteRevision: '1_aaa',
      data: {'hello': 'difficult merge'},
    }, {
      _id: '4l',
      revision: '1_b4',
      remoteRevision: '1_b4',
      data: {'some': 'other data'},
    }];
    console.log(localData);
    const merged = Sync.merge(remoteData, localData);
    console.log(merged);
  };

  Test.run = function() {
    Test.merge();
  };

  return Test;
};
