"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = diffDays;
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function diffDays(date) {
  let a = (0, _moment.default)(new Date(date), 'M/D/YYYY');
  let b = (0, _moment.default)(new Date(), 'M/D/YYYY');
  let diffDays = b.diff(a, 'days');
  return diffDays;
}
module.exports = exports.default;