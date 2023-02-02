"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EBBTable;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
require("./styles.css");
var _constants = require("./constants");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const originData = [{
  sac: '8EBBHJSUY900',
  enrollmentDate: '02/35/2993',
  enrollmentCode: '2323523555',
  subscriberId: 'ETET35635',
  ctn: '353535666',
  serviceType: 'Voice',
  city: 'Hatilo',
  state: 'PR',
  status: 'NEW'
}];
function EBBTable() {
  const [form] = _antd.Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = (0, _react.useState)([]);
  const [selectedRows, setSelectedRows] = (0, _react.useState)([]);
  const [editingKey, setEditingKey] = (0, _react.useState)('');
  const [data, setData] = (0, _react.useState)(originData);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    fixed: true
  };
  function onSelectChange(selectedRowKeys, selectedRows) {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  }
  function EditableCell(_ref) {
    let {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = _ref;
    return /*#__PURE__*/_react.default.createElement("td", restProps, editing ? /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
      name: dataIndex,
      style: {
        margin: 0
      },
      rules: [{
        required: true,
        message: `Please Input ${title}!`
      }]
    }, /*#__PURE__*/_react.default.createElement(_antd.Input, null)) : children);
  }
  const isEditing = record => record.key === editingKey;
  const columns = [{
    title: 'SAC CODE',
    dataIndex: 'sac',
    fixed: 'left',
    width: 150,
    className: 'ebbTableHeader'
  }, {
    title: 'ENROLLMENT DATE',
    dataIndex: 'enrollmentDate',
    className: 'ebbTableHeader'
  }, {
    title: 'ENROLLMENT CODE',
    dataIndex: 'enrollmentCode',
    className: 'ebbTableHeader'
  }, {
    title: 'SUBSCRIBRER ID',
    dataIndex: 'subscriberId',
    className: 'ebbTableHeader'
  }, {
    title: 'PHONE NUMBER',
    dataIndex: 'ctn',
    className: 'ebbTableHeader'
  }, {
    title: 'SERVICE TYPE',
    dataIndex: 'serviceType',
    className: 'ebbTableHeader'
  }, {
    title: 'CITY',
    dataIndex: 'city',
    className: 'ebbTableHeader'
  }, {
    title: 'STATE',
    dataIndex: 'state',
    className: 'ebbTableHeader'
  }, {
    title: 'STATUS',
    dataIndex: 'status',
    className: 'ebbTableHeader',
    editable: true
  }, {
    title: 'ACTIONS',
    dataIndex: 'action',
    fixed: 'right',
    className: 'ebbTableHeader',
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("a", {
        href: "#!",
        onClick: () => {
          save();
        },
        style: {
          marginRight: 8
        }
      }, "Save"), /*#__PURE__*/_react.default.createElement(_antd.Popconfirm, {
        title: "Sure to cancel?",
        onConfirm: cancel
      }, /*#__PURE__*/_react.default.createElement("a", null, "Cancel"))) : /*#__PURE__*/_react.default.createElement(_antd.Typography.Link, {
        disabled: editingKey !== '',
        onClick: () => edit(record)
      }, "Update");
    }
  }];
  function edit(record) {
    form.setFieldsValue({
      ...record
    });
    setEditingKey(record.key);
  }
  function cancel() {
    setEditingKey('');
  }
  async function save(key) {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  }
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });
  let ebbCSVHeaders = columns.slice();
  ebbCSVHeaders.splice(columns.findIndex(e => e.dataIndex === 'actions'), 1);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "ebb-table-wrapper"
  }, /*#__PURE__*/_react.default.createElement(_constants.EBBFilters, {
    selectedRows: selectedRows,
    ebbCSVHeaders: ebbCSVHeaders
  }), /*#__PURE__*/_react.default.createElement(_antd.Form, {
    form: form,
    component: false
  }, /*#__PURE__*/_react.default.createElement(_antd.Table, {
    columns: mergedColumns,
    rowKey: "sac",
    dataSource: data,
    pagination: {
      position: 'bottom'
    },
    bordered: true,
    className: "cm-table mt-2",
    rowSelection: rowSelection,
    rowClassName: "ebbTableHeader",
    components: {
      body: {
        cell: EditableCell
      }
    },
    scroll: {
      x: '100vw'
    }
  })));
}
module.exports = exports.default;