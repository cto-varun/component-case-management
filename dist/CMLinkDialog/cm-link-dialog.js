"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CMLinkDialog;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function CMLinkDialog(_ref) {
  let {
    visible,
    onCancel,
    suggestions
  } = _ref;
  const getColumns = () => [{
    title: 'CTN',
    dataIndex: 'phoneNumber',
    sorter: (a, b) => a.phoneNumber - b.phoneNumber
  }, {
    title: 'BAN',
    dataIndex: 'billingAccountNumber,',
    sorter: (a, b) => a.billingAccountNumber - b.billingAccountNumber
  }, {
    title: 'CREATED',
    dataIndex: 'createdAt',
    sorter: (a, b) => a.createdAt - b.createdAt,
    render: value => {
      return new Date(value).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h12'
      });
    }
  }, {
    title: 'CATEGORY',
    dataIndex: 'category',
    sorter: (a, b) => a.category - b.category
  }, {
    title: 'SUBCATEGORY1',
    dataIndex: 'subCategory1',
    sorter: (a, b) => a.subCategory1 - b.subCategory1
  }, {
    title: 'SUBCATEGORY2',
    dataIndex: 'subCategory2',
    sorter: (a, b) => a.subCategory2 - b.subCategory2
  }];
  const caseHistory = data => {
    return data && data.caseHistory && data.caseHistory[0];
  };
  const columnData = suggestions?.map(caseData => {
    let value = {
      ...caseData,
      category: caseHistory(caseData)?.category,
      subCategory1: caseHistory(caseData)?.subCategory1,
      subCategory2: caseHistory(caseData)?.subCategory2
    };
    return value;
  });
  return /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    className: "cm-link-case-modal",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex flex-column"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "cm-link-case-header"
    }, "Link Case To"), /*#__PURE__*/_react.default.createElement("div", {
      className: "search-box-wrapper d-flex flex-row align-items-center"
    }, /*#__PURE__*/_react.default.createElement(_antd.Radio.Group, {
      options: ['Existing Case', 'Interaction'],
      onChange: () => {},
      defaultValue: "Existing Case"
    }), /*#__PURE__*/_react.default.createElement(_antd.Input, {
      placeholder: "Search BAN or customer CTN ",
      suffix: /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, {
        style: {
          color: 'rgba(0, 0, 0, 0.45)'
        }
      }),
      className: "search-box"
    }))),
    open: visible,
    onCancel: onCancel,
    footer: null,
    width: 900
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "suggest-table"
  }, /*#__PURE__*/_react.default.createElement("div", null, "Smart Suggest"), /*#__PURE__*/_react.default.createElement(_antd.Table, {
    className: "cm-suggest-table",
    columns: getColumns(),
    dataSource: columnData,
    rowSelection: {
      columnWidth: 32
    },
    size: "middle",
    rowKey: "id",
    showHeader: false,
    pagination: false
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center justify-content-between action-buttons"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "cancel-button",
    onClick: onCancel
  }, "Cancel")));
}
module.exports = exports.default;