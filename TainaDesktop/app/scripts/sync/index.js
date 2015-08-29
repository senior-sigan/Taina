'use strict';

const Promise = window.require('bluebird');
const logger = window.require('winston');
const _ = window.require('lodash');
const Random = require('../helpers/Random');

/**
 * create Synch object
 * @param  {Database} db
 * @param  {array} synchServices - list of services implemented synchronization interface: DropboxSync, GoogleSync.
 * @return {Synch}
 */
module.exports.create = function(db, syncServices) {
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
   * @property {String} _revision - current revision in format '1_f39c6cb6-a271-4350-bb13-20450da27827'
   * @property {Object[]} _revisions - list of all revisions
   * @property {String} _revisions[]._revision - is revision of this object
   * @property {Object} _revisions[].data - payload
   */

  /**
   * @typedef  {Object} LocalData
   * @property {String} _id - in format 'f39c6cb6-a271-4350-bb13-20450da27827'
   * @property {String} _remoteRevision - last saved remote revision
   * @property {String} _revision - current revision in format '1_f39c6cb6-a271-4350-bb13-20450da27827'
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
      return doc._remoteRevision !== doc._revision;
    });

    _.forEach(localChanges, function(doc) {
      if (indexedRemoteData[doc._id]._revision === doc._remoteRevision) {
        // remote data has no changes, so just add new changes
        indexedRemoteData[doc._id]._revisions.push({
          _revision: doc._revision,
          data: doc.data
        });
        indexedRemoteData[doc._id]._revision = doc._revision;
      } else {
        // remote data has been changed too, so save local changes as new data
        let newId = Random.uuid();
        indexedRemoteData[newId] = {
          _id: newId,
          _revision: doc._revision,
          _revisions: [{
            _revision: doc._revision,
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
        _remoteRevision: doc._revision,
        _revision: doc._revision,
        data: doc.data
      });
    });

    return {
      localData: newLocalData,
      remoteData: newRemoteData
    };
  };

  return Sync;
};
