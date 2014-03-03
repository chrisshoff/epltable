/**
 * Teams
 *
 * @module      :: Team model
 * @description :: 
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: "STRING",
    slug: "STRING",
    position: "INTEGER",
    gd: "INTEGER",
    points: "INTEGER",
    matches: "ARRAY"
  }

};
