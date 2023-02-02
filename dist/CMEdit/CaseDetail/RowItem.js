"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RowItem;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function RowItem(_ref) {
  let {
    title,
    content,
    isHtml,
    className
  } = _ref;
  const date = title?.includes('DateTime') ? new Date(content).toLocaleString() : null;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: `data-item ${className}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "data-item-header"
  }, title), isHtml ? /*#__PURE__*/_react.default.createElement("div", {
    className: "data-item-content",
    dangerouslySetInnerHTML: {
      __html: content
    }
  }) : /*#__PURE__*/_react.default.createElement("div", {
    className: "data-item-content"
  }, date ? date : content ? content : 'N/A'));
}
module.exports = exports.default;