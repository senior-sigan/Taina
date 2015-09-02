import PromiseA from 'bluebird';
import logger from 'winston';

/**
 * create Synch object
 * @param  {Database} db
 * @param  {array} synchServices - list of services implemented synchronization interface: DropboxSync, GoogleSync.
 * @param  {object} Random
 * @param  {function} Random.uuid
 * @return {Synch}
 */
module.exports.create = (db, syncServices, Merger) => {
  const Sync = {};

  Sync.runOne = (syncService) => {
    const loadRemoteData = syncService.loadData();
    const loadLocalData = db.getAllNotes();

    return PromiseA.join(loadRemoteData, loadLocalData, (remoteData, localData) => {
      const merged = Merger.merge(remoteData, localData);
      const bulkUpdating = db.bulkUpdate(merged.localData);
      const remoteBulkSaving = syncService.bulkSave(merged.remoteData);
      return PromiseA.all([bulkUpdating, remoteBulkSaving]);
    }).then(() => {
      logger.info('All data saved and synchronized in ' + syncService.name);
    });
  };

  Sync.run = () => {
    return PromiseA
      .map(syncServices, service => Sync.runOne(service))
      .then(() => logger.info('Synchronization was completed'));
  };

  return Sync;
};
