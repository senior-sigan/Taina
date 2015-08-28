'use strict';

const logger = window.require('winston');
const _ = window.require('lodash');
const moment = window.require('moment');
const uuid = window.require('node-uuid');
const Promise = window.require('bluebird');

/**
 * create Database object
 * @return {DB} Database module
 */
module.exports.create = function() {
  const DB = {};
  const Notes = new window.PouchDB('notes', {
    adapter: 'idb'
  });

  /**
   * getAllNotes
   * @return {
   *  {
   *  	_id: string,
   *   	title: string,
   *   	body: {
   *   		data: string,
   *   		iv: string
   *   	}
   *  }[]
   * } promise with array of notes
   */
  DB.getAllNotes = function() {
    return Notes.allDocs().then(function(result) {
      return Promise.map(result.rows, function(row) {
        return DB.getNote(row.id).then(function(doc) {
          return {
            _id: doc._id,
            _rev: doc._rev,
            _revisions: doc._revisions,
            title: doc.title,
            body: doc.body
          };
        });
      }).then(function(notes) {
        console.log(notes);
        return notes;
      });
    }).catch(function(err) {
      logger.error('Database#getAllNotes: %s', JSON.stringify(err, null, ' '));
      throw err;
    });
  };

  /**
   * addNote
   * @description id for new note generated as uuid
   * @param  {object} note
   * @param  {string} note.title
   * @param  {object} note.body
   * @param  {string} note.body.data - encrypted data
   * @param  {string} note.body.iv - initialization vector
   * @return {Promise} note object
   */
  DB.addNote = function(note) {
    let date = moment().toISOString();

    return Notes.put({
      _id: uuid.v4(),
      title: note.title,
      body: note.body,
      createdAt: date,
      updatedAt: date
    }).then(function(result) {
      logger.debug(JSON.stringify(result, null, ' '));
      return result;
    }).catch(function(err) {
      logger.error(
        'Database#addNote(%s): %s',
        JSON.stringify(note, null, ' '),
        JSON.stringify(err, null, ' ')
      );
    });
  };

  /**
   * getNote
   * @param  {string} id - id of note
   * @return {Promise} note
   */
  DB.getNote = function(id) {
    return Notes.get(id, {
      attachments: true,
      revs: true
    }).then(function(note) {
      logger.info(JSON.stringify(note, null, ' '));
      return note;
    });
  };

  /**
   * editNote
   * @param  {string} id - id of the note to edit
   * @param  {object} note
   * @param  {string} note.title
   * @param  {object} note.body
   * @param  {string} note.body.data - encrypted data
   * @param  {string} note.body.iv - initialization vector
   * @return {Promise}
   */
  DB.editNote = function(id, note) {
    let date = moment().toISOString();
    return Notes.get(id).then(function(doc) {
      let changes = {
        _id: id,
        _rev: doc._rev,
        updatedAt: date,
        title: note.title || doc.title,
        body: note.body || doc.body
      };
      console.log(changes);

      return Notes.put(changes).then(function(result) {
        logger.debug(JSON.stringify(result, null, ' '));
        return result;
      }).catch(function(err) {
        logger.error(
          'Database#editNote(%s): %s',
          JSON.stringify(note, null, ' '),
          JSON.stringify(err, null, ' ')
        );
      });
    });
  };

  DB.drop = function() {
    return Notes.destroy().then(function() {
      logger.info('Database destroyed');
      indexedDB.deleteDatabase('_pouch_notes');
    }).catch(function(err) {
      logger.error('Database#drop failed: %s', JSON.stringify(err, null, ' '));
      throw err;
    });
  };

  return DB;
};
