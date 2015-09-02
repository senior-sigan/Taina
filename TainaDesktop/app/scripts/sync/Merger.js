import _ from 'lodash';

export default {
  create(random) {
    const Merger = {};

    /**
     * @typedef  {Object} RemoteData
     * @property {String} _id - in format 'f39c6cb6-a271-4350-bb13-20450da27827'
     * @property {String} revision - current revision in format '1_f39c6cb6-a271-4350-bb13-20450da27827'
     * @property {Object[]} revisions - list of all revisions
     * @property {String} revisions[]._revision - is revision of this object
     * @property {Object} revisions[].data - payload
     */

    /**
     * @typedef  {Object} LocalData
     * @property {String} _id - in format 'f39c6cb6-a271-4350-bb13-20450da27827'
     * @property {String} remoteRevision - last saved remote revision
     * @property {String} revision - current revision in format '1_f39c6cb6-a271-4350-bb13-20450da27827'
     * @property {Object} data - payload
     */

    /**
     * @function merge
     * @description merge remote and local data. As result produce new state for remote and local data.
     * @param  {RemoteData[]} remoteData
     * @param  {LocalData[]} localData
     * @return {{remoteData: RemoteData[], localData: LocalData[]}}
     */
    Merger.merge = (remoteData, localData) => {
      const indexedRemoteData = _.indexBy(remoteData, '_id');
      // if remote and local revisions are different so object was changed
      const localChanges = _.filter(localData, doc => doc.remoteRevision !== doc.revision);
      const localUnchanged = _.filter(localData, doc => doc.remoteRevision === doc.revision);

      _.forEach(localUnchanged, doc => {
        const id = doc._id;
        if (!indexedRemoteData[id]) {
          indexedRemoteData[id] = {
            _id: id,
            revision: doc.revision,
            revisions: [{
              revision: doc.revision,
              data: doc.data,
            }],
          };
        }
      });

      _.forEach(localChanges, doc => {
        if (indexedRemoteData[doc._id] && indexedRemoteData[doc._id].revision === doc.remoteRevision) {
          // remote data has no changes, so just add new changes
          indexedRemoteData[doc._id].revisions.push({
            revision: doc.revision,
            data: doc.data,
          });
          indexedRemoteData[doc._id].revision = doc.revision;
        } else {
          // remote data has been changed too, so save local changes as new data
          let id = random.uuid();
          if (_.isNull(doc.remoteRevision)) {
            // local data is new
            id = doc._id;
          }
          indexedRemoteData[id] = {
            _id: id,
            revision: doc.revision,
            revisions: [{
              revision: doc.revision,
              data: doc.data,
            }],
          };
        }
      });

      const newLocalData = [];
      const newRemoteData = [];
      _.forEach(indexedRemoteData, doc => {
        newRemoteData.push(doc);
        newLocalData.push({
          _id: doc._id,
          remoteRevision: doc.revision,
          revision: doc.revision,
          data: doc.revisions[doc.revisions.length - 1].data,
        });
      });

      return {
        localData: newLocalData,
        remoteData: newRemoteData,
      };
    };

    return Merger;
  },
};
