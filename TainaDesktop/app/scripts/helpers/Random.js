'use strict';

const uuid = window.require('node-uuid');
const _ = require('lodash');
const Random = {};

Random.uuid = function() {
  return uuid.v4();
};

/**
 * @function revision
 * @description generate next revision number in format #{number}_#{uuid};
 * @param  {Number|null} number
 * @return {string} in format 1_f39c6cb6-a271-4350-bb13-20450da27827
 */
Random.nextRevision = function(oldRevision) {
  let uuid = Random.uuid();
  let order = 1;
  if (!!oldRevision) {
    order = parseInt(oldRevision.split('_')[0]) + 1;
  }

  return order + '_' + uuid;
};

module.exports = Random;
