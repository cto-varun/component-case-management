"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _cmContent = _interopRequireDefault(require("./CMContent/cm-content"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function CaseManagement(props) {
  return /*#__PURE__*/_react.default.createElement(_cmContent.default, props);
}
var _default = CaseManagement;
exports.default = _default;
module.exports = exports.default;