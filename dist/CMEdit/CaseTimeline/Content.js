"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Content;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function Content(_ref) {
  let {
    index,
    data,
    caseHistory
  } = _ref;
  const {
    Title,
    Text
  } = _antd.Typography;
  let additionalPropertiesArray = [];
  caseHistory[index]?.additionalProperties && Object.entries(caseHistory[index]?.additionalProperties)?.forEach(_ref2 => {
    let [key, value] = _ref2;
    additionalPropertiesArray.push({
      key: key,
      value: value
    });
  });
  const getFieldValue = value => value ? value : 'N/A';
  return /*#__PURE__*/_react.default.createElement("div", {
    style: {
      padding: '1% 0%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, null, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 8,
    className: "form-view-background"
  }, /*#__PURE__*/_react.default.createElement(Title, {
    level: 5
  }, caseHistory[index]?.status), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    direction: "vertical"
  }, /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Creation Date : "), /*#__PURE__*/_react.default.createElement(Text, null, getFieldValue(data.createdAt) === 'N/A' ? 'N/A' : (0, _moment.default)(data.createdAt).format('DD MMM YYYY, h:mm a'))), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Updated By : "), /*#__PURE__*/_react.default.createElement(Text, null, getFieldValue(caseHistory[index]?.updatedBy || data.createdBy))), caseHistory[index]?.state === 'Closed' && caseHistory[index]?.resolution && /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Resolution: : "), getFieldValue(caseHistory[index]?.resolution)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Assigned To : "), caseHistory[index]?.assignedTo || data.createdBy), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Case Condition : "), getFieldValue(caseHistory[index]?.state)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Case ID : "), getFieldValue(data.caseId)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Category : "), getFieldValue(caseHistory[index]?.category)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Subcategory 1 : "), getFieldValue(caseHistory[index]?.subCategory1)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Subcategory 2 : "), getFieldValue(caseHistory[index]?.subCategory2)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Priority : "), getFieldValue(caseHistory[index]?.priority)), /*#__PURE__*/_react.default.createElement(Text, {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mw-140"
  }, "Queue : "), getFieldValue(caseHistory[index]?.assignedTeam)), additionalPropertiesArray?.map(_ref3 => {
    let {
      key,
      value
    } = _ref3;
    return /*#__PURE__*/_react.default.createElement(Text, {
      className: "d-flex"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mw-140"
    }, key.charAt(0).toUpperCase() + key.slice(1), ' ', ":", ' '), getFieldValue(value));
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 15,
    offset: 1,
    className: "form-view-background"
  }, /*#__PURE__*/_react.default.createElement(Title, {
    level: 5
  }, "Notes"), /*#__PURE__*/_react.default.createElement(Text, {
    className: "detail-txt"
  }, /*#__PURE__*/_react.default.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: getFieldValue(caseHistory[index]?.summary || data?.description)
    }
  })))));
}
module.exports = exports.default;