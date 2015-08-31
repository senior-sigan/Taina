import Promise from 'bluebird';
import winston from 'winston';
import remote from 'remote';
import moment from 'moment';
import dbox from 'dbox';
const BrowserWindow = remote.require('browser-window');

/**
 * create DropboxSync object
 * @param  {object} options
 * @param  {string} options.key
 * @param  {string} options.secret
 * @return {DropboxSync}
 */
module.exports.create = function(options) {
  const dboxApp = dbox.app({'app_key': options.key, 'app_secret': options.secret});
  const DropboxSync = {
    name: 'Dropbox',
  };
  const browserConfig = {
    height: 600,
    width: 800,
    show: false,
    'node-integration': false,
    'web-preferences': {
      'web-security': true,
    },
  };
  const storage = localStorage;
  const DB_KEY = '_taina_dropbox_access_token';
  const DATA_PATH = '/taina.json';
  const EMPTY_DATA = {
    data: [],
  };

  function getClient() {
    return DropboxSync.getToken().then(accessToken => dboxApp.client(accessToken));
  }

  DropboxSync.getAccountInfo = function() {
    return getClient().then(client => {
      return new Promise((resolve, reject) => {
        client.account((status, data) => {
          if (status === 200) {
            resolve({
              email: data.email,
              name: data.display_name,
            });
          } else {
            reject('[DropboxSync] can\'t get account info ' + data.error);
          }
        });
      });
    });
  };

  DropboxSync.saveData = function(_data) {
    const data = JSON.stringify(_data || EMPTY_DATA, null, ' ');
    return getClient().then(client => {
      return new Promise((resolve, reject) => {
        client.put(DATA_PATH, data, {}, (status, reply) => {
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
      lastSync: moment().toISOString(),
    });
  };

  DropboxSync.loadData = function() {
    return getClient().then(client => {
      return new Promise((resolve, reject) => {
        client.get(DATA_PATH, {}, (status, data, metadata) => {
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
    const accessToken = storage.getItem(DB_KEY);
    if (!accessToken) {
      throw new Error('Dropbox accessToken not found. Get new one.');
    }
    return JSON.parse(accessToken);
  });

  /**
   * @method startAuth
   * @description Open new window and start dropbox authentication. Save accessToken in storage.
   * @return {Promise} dropbox accessToken
   */
  DropboxSync.startAuth = function() {
    let authWindow = new BrowserWindow(browserConfig);
    authWindow.on('close', () => {
      authWindow = null;
    }, false);

    return new Promise((resolve, reject) => {
      dboxApp.requesttoken((status, token) => {
        if (status === 200) {
          authWindow.loadUrl(token.authorize_url);
          authWindow.show();
          authWindow.on('page-title-updated', () => {
            if (authWindow.getUrl() === 'https://www.dropbox.com/1/oauth/authorize_submit') {
              authWindow.close();
              dboxApp.accesstoken(token, (statusAT, accessToken) => {
                if (statusAT === 200) {
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
