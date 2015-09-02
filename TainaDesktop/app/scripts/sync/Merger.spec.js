import Merger from './Merger';
import {expect} from 'chai';
import Random from '../helpers/Random';
const merger = Merger.create(Random);

describe('Merger', () => {
  it('should merge empty data', () => {
    const localData = [];
    const remoteData = [];
    const data = merger.merge(remoteData, localData);
    expect(data.localData).to.eql([]);
    expect(data.remoteData).to.eql([]);
  });

  it('should merge simple states', () => {
    const remoteData = [{
      _id: '1r',
      revision: '1_a',
      revisions: [{
        revision: '1_a',
        data: {'hello': 'world'},
      }],
    }];
    const localData = [{
      _id: '1l',
      revision: '1_b',
      remoteRevision: null,
      data: {'some': 'other data'},
    }];
    const data = merger.merge(remoteData, localData);
    expect(data.remoteData).to.eql([{
      _id: '1r',
      revision: '1_a',
      revisions: [{
        revision: '1_a',
        data: {'hello': 'world'},
      }],
    }, {
      _id: '1l',
      revision: '1_b',
      revisions: [{
        revision: '1_b',
        data: {'some': 'other data'},
      }],
    }]);
    expect(data.localData).to.eql([{
      _id: '1r',
      revision: '1_a',
      remoteRevision: '1_a',
      data: {'hello': 'world'},
    }, {
      _id: '1l',
      revision: '1_b',
      remoteRevision: '1_b',
      data: {'some': 'other data'},
    }]);
  });

  it('should merge difficult object states', () => {
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
    const data = merger.merge(remoteData, localData);
    expect(data.localData).to.have.length(6);
    expect(data.remoteData).to.have.length(6);
  });
});
