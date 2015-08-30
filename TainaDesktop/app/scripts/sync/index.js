'use strict';

const Promise = window.require('bluebird');
const logger = window.require('winston');
const _ = window.require('lodash');

/**
 * create Synch object
 * @param  {Database} db
 * @param  {array} synchServices - list of services implemented synchronization interface: DropboxSync, GoogleSync.
 * @param  {object} Random
 * @param  {function} Random.uuid
 * @return {Synch}
 */
module.exports.create = function(db, syncServices, Random) {
  const Sync = {};

  Sync.runOne = function(syncService) {
    let loadRemoteData = syncService.loadData();
    let loadLocalData = db.getAllNotes();

    return Promise.join(loadRemoteData, loadLocalData, function(remoteData, localData) {
      let merged = Sync.merge(remoteData,localData);
      let bulkUpdating = db.bulkUpdate(merged.localData);
      let remoteBulkSaving = syncService.bulkSave(merged.remoteData);
      return Promise.all([bulkUpdating, remoteBulkSaving]);
    }).then(function() {
      logger.info('All data saved and synchronized in ' + syncService.name);
    });
  };

  Sync.run = function() {
    return Promise.map(syncServices, function(service) {
      return Sync.runOne(service);
    }).then(function() {
      logger.info('Synchronization was completed');
    });
  };

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
   * @method merge
   * @description merge remote and local data. As result produce new state for remote and local data.
   * @param  {RemoteData[]} remoteData
   * @param  {LocalData[]} localData
   * @return {{remoteData: RemoteData[], localData: LocalData[]}}
   */
  Sync.merge = function(remoteData, localData) {
    let indexedRemoteData = _.indexBy(remoteData, '_id');
    let localChanges = _.filter(localData, function(doc) {
      // if remote and local revisions are different so object was changed
      return doc.remoteRevision !== doc.revision;
    });
    let localUnchanged = _.filter(localData, function(doc) {
      return doc.remoteRevision === doc.revision;
    });

    _.forEach(localUnchanged, function(doc) {
      let id = doc._id;
      if (!indexedRemoteData[id]) {
        indexedRemoteData[id] = {
          _id: id,
          revision: doc.revision,
          revisions: [{
            revision: doc.revision,
            data: doc.data
          }]
        };
      }
    });

    _.forEach(localChanges, function(doc) {
      if (indexedRemoteData[doc._id] && indexedRemoteData[doc._id].revision === doc.remoteRevision) {
        // remote data has no changes, so just add new changes
        indexedRemoteData[doc._id].revisions.push({
          revision: doc.revision,
          data: doc.data
        });
        indexedRemoteData[doc._id].revision = doc.revision;
      } else {
        // remote data has been changed too, so save local changes as new data
        let id = Random.uuid();
        if (_.isNull(doc.remoteRevision)) {
          // local data is new
          id = doc._id;
        }
        indexedRemoteData[id] = {
          _id: id,
          revision: doc.revision,
          revisions: [{
            revision: doc.revision,
            data: doc.data
          }]
        };
      }
    });

    let newLocalData = [];
    let newRemoteData = [];
    _.forEach(indexedRemoteData, function(doc) {
      newRemoteData.push(doc);
      newLocalData.push({
        _id: doc._id,
        remoteRevision: doc.revision,
        revision: doc.revision,
        data: doc.revisions[doc.revisions.length - 1].data
      });
    });

    return {
      localData: newLocalData,
      remoteData: newRemoteData
    };
  };

  return Sync;
};
