'use strict';

const Promise = window.require('bluebird');
const winston = window.require('winston');

/**
 * create Synch object
 * @param  {SaltRepository} saltRepository
 * @param  {Database} db
 * @param  {array} synchServices - list of services implemented synchronization interface: DropboxSync, GoogleSync.
 * @return {Synch}
 */
module.exports.create = function(saltRepository, db, syncServices) {
  const Sync = {};

  Sync.run = function(syncService) {
    
  };

  return Sync;
};
