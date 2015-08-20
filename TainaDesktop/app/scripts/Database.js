'use strict';

window.DB = (function(PouchDB) {
  const logger = require('winston');
  const _ = require('lodash');
  const moment = require('moment');
  const module = {};

  /**
   * create Database object
   * @return {DB} Database module
   */
  module.create = function() {
    const DB = {};
    const Notes = new PouchDB('notes', {adapter: 'idb'});

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
      return Notes.allDocs({
        'include_docs': true,
        attachments: true
      }).then(function(result) {
        return _.map(result.rows, function(row) {
          let note = row.doc;

          return {
            _id: note._id,
            title: note.title,
            body: note.body
          };
        });
      }).catch(function(err) {
        logger.error('Database#getAllNotes: %s', JSON.stringify(err, null, ' '));
      });
    };

    /**
     * addNote
     * @param  {object} note
     * @param  {string} note.title
     * @param  {string} note.body
     * @return {Promise} note object
     */
    DB.addNote = function(note) {
      let date = moment().toISOString();

      return Notes.post({
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
      return Notes.get(id, {attachments: true}).then(function(note) {
        logger.debug(JSON.stringify(note, null, ' '));
        return note;
      });
    };

    return DB;
  };

  return module;
})(window.PouchDB);
