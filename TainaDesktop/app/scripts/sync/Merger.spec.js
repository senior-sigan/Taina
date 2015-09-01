import {merge} from './Merger';
import {expect} from 'chai';

describe('Merger', () => {
  it('should merge empty data', () => {
    const localData = [];
    const remoteData = [];
    const data = merge(remoteData, localData);
    expect(data.localData).to.eql([]);
    expect(data.remoteData).to.eql([]);
  });
});
