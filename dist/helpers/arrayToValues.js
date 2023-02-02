"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 *  Get the privilages by using type
 * @param {String} type
 * @returns {Boolean} true or false
 */
const arrayToValues = privileges => {
  let values = {};
  privileges?.categories?.map(_ref => {
    let {
      name
    } = _ref;
    values[name] = true;
  });
  return values;
};
var _default = arrayToValues;
exports.default = _default;
module.exports = exports.default;