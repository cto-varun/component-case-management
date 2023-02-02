"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EBBFilters = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _antTableExtensions = require("ant-table-extensions");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const EBBFilters = props => {
  const {
    selectedRows,
    ebbCSVHeaders
  } = props;
  return /*#__PURE__*/_react.default.createElement(_antd.Space, {
    className: "ebb-table-filters",
    size: 20
  }, /*#__PURE__*/_react.default.createElement(_antTableExtensions.ExportTableButton, {
    dataSource: selectedRows,
    columns: ebbCSVHeaders,
    fileName: "Cases",
    btnProps: {
      type: 'primary',
      icon: /*#__PURE__*/_react.default.createElement(_icons.FileExcelOutlined, null)
    },
    showColumnPicker: true
  }, "Export to CSV"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary"
  }, "Update", /*#__PURE__*/_react.default.createElement(_icons.DownloadOutlined, null)));
};
exports.EBBFilters = EBBFilters;