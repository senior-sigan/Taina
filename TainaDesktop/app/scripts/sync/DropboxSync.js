'use strict';

const Promise = window.require('bluebird');
const winston = window.require('winston');
const remote = window.require('remote');
const BrowserWindow = remote.require('browser-window');
const moment = window.require('moment');
const dbox  = window.require('dbox');

/**
 * create DropboxSync object
 * @param  {object} options
 * @param  {string} options.key
 * @param  {string} options.secret
 * @return {DropboxSync}
 */
module.exports.create = function(options) {
  const dboxApp = dbox.app({'app_key' : options.key, 'app_secret': options.secret});
  const DropboxSync = {
    name: 'Dropbox'
  };
  const browserConfig = {
    height: 600,
    width: 800,
    show: false,
    'node-integration': false,
    'web-preferences': {
      'web-security': true
    }
  };
  const storage = localStorage;
  const DB_KEY = '_taina_dropbox_access_token';
  const DATA_PATH = '/taina.json';
  const EMPTY_DATA = {
    data: []
  };

  function getClient() {
    return DropboxSync.getToken().then(function(accessToken) {
      return dboxApp.client(accessToken);
    });
  }

  DropboxSync.getAccountInfo = function() {
    return getClient().then(function(client) {
      return new Promise(function(resolve, reject) {
        client.account(function(status, data) {
          if (status === 200) {
            resolve({
              email: data.email,
              name: data.display_name
            });
          } else {
            reject('[DropboxSync] can\'t get account info ' + data.error);
          }
        });
      });
    });
  };

  DropboxSync.saveData = function(data) {
    data = JSON.stringify(data || EMPTY_DATA, null, ' ');
    return getClient().then(function(client) {
      return new Promise(function(resolve, reject) {
        client.put(DATA_PATH, data, {}, function(status, reply) {
          if (status === 200) {
            winston.info('[DropboxSync] data was saved ' + JSON.stringify(reply));
            resolve(null);
          } else {
            reject('[DropboxSync] can\'t save data ' + JSON.stringify(reply));
          }
        });
      });
    });
  };

  /**
   * @method bulkSave
   * @param  {Object[]} data
   * @return {Promise}
   */
  DropboxSync.bulkSave = function(data) {
    return DropboxSync.saveData({
      data: data,
      lastSync: moment().toISOString()
    });
  };

  DropboxSync.loadData = function() {
    return getClient().then(function(client) {
      return new Promise(function(resolve, reject) {
        client.get(DATA_PATH, {}, function(status, data, metadata) {
          if (status === 404) {
            winston.info('[DropboxSync] Data file not found ' + DATA_PATH);
            resolve([]);
          } else if (status === 200) {
            winston.info('[DropboxSync] Data loaded ' + JSON.stringify(metadata, null, ' '));
            resolve(JSON.parse(data.toString()).data);
          } else {
            reject('[DropboxSync] can\'t load data ' + data.toString());
          }
        });
      });
    });
  };

  /**
   * @method getToken
   * @description Load Dropbox access token from storage. Reject if not found
   * @return {Promise} accessToken
   */
  DropboxSync.getToken = Promise.method(function() {
    let accessToken = storage.getItem(DB_KEY);
    if (accessToken) {
      return JSON.parse(accessToken);
    } else {
      throw 'Dropbox accessToken not found. Get new one.';
    }
  });

  /**
   * @method startAuth
   * @description Open new window and start dropbox authentication. Save accessToken in storage.
   * @return {Promise} dropbox accessToken
   */
  DropboxSync.startAuth = function() {
    let authWindow = new BrowserWindow(browserConfig);
    authWindow.on('close', function() {
      authWindow = null;
    }, false);

    return new Promise(function(resolve, reject) {
      dboxApp.requesttoken(function(status, token) {
        if (status === 200) {
          authWindow.loadUrl(token.authorize_url);
          authWindow.show();
          authWindow.on('page-title-updated', function() {
            if (authWindow.getUrl() === 'https://www.dropbox.com/1/oauth/authorize_submit') {
              authWindow.close();
              dboxApp.accesstoken(token, function(status, accessToken) {
                if (status === 200) {
                  storage.setItem(DB_KEY, JSON.stringify(accessToken));
                  winston.info('[DropboxSync] accessToken loaded');
                  resolve(accessToken);
                } else {
                  winston.error('Can\'t get dropbox accessToken: %d, %s',
                    status, JSON.stringify(accessToken, null, ' '));
                  reject('[DropboxSync] can\t get accessToken: ' + status);
                }
              });
            }
          });
        } else {
          winston.error('Can\'t start dropbox auth: %d, %s', status, JSON.stringify(token, null, ' '));
          reject('[DropboxSync] can\'t start auth: ' + status);
        }
      });
    });
  };

  DropboxSync.getClient = getClient;
  return DropboxSync;
};
