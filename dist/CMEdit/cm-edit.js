"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CMEdit;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _CaseDetail = require("./CaseDetail");
var _caseTimeline = _interopRequireDefault(require("./CaseTimeline/case-timeline"));
var _diffDays = _interopRequireDefault(require("../helpers/diffDays"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const RightTabActions = _ref => {
  let {
    data,
    onEdit,
    onAssign,
    onLink,
    onLaunch,
    onToggle,
    onCloseEdit,
    privileges,
    disableButtons,
    disableEdit,
    attId,
    caseLoading,
    onClaim,
    cmMode,
    selectedRows
  } = _ref;
  /**
   *
   * @param {String} type
   * @returns Button with tooltip
   */
  const ButtonTooltip = _ref2 => {
    let {
      type,
      disabled,
      children,
      ...props
    } = _ref2;
    return disabled ? /*#__PURE__*/_react.default.createElement(_antd.Tooltip, _extends({
      title: `No privileges to ${type}`
    }, props), children) : children;
  };
  const owner = data?.caseHistory[0]?.assignedTo && data?.caseHistory[0]?.assignedTo === attId;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "right-tab-actions d-flex flex-row align-items-center"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "severity-icon background-severity-high",
    style: {
      width: 10,
      height: 10
    }
  }), data?.commitedSLA > 0 && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      marginLeft: 10,
      marginRight: 28
    }
  }, "SLA : Exceeded by", ' ', Math.floor((new Date().getTime() - new Date(data?.committedSLA).getTime()) / 1000 / 60 / 60 / 24), ' ', "days"), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 10,
    align: "center"
  }, data?.caseId.includes('C-') && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, onEdit && /*#__PURE__*/_react.default.createElement(ButtonTooltip, {
    type: 'Edit'
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "link-button",
    onClick: onEdit,
    disabled: disableEdit
  }, /*#__PURE__*/_react.default.createElement(_icons.EditOutlined, null), " Edit Case")), onClaim && !cmMode && /*#__PURE__*/_react.default.createElement(ButtonTooltip, {
    type: 'Claim'
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "link-button",
    onClick: () => onClaim(),
    disabled: !privileges.Edit || disableButtons || selectedRows.length > 1
  }, "Claim")), onAssign && !cmMode && /*#__PURE__*/_react.default.createElement(ButtonTooltip, {
    type: 'Assign'
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "link-button",
    onClick: () => onAssign('Assign'),
    disabled: !privileges.Edit || disableButtons
  }, "Assign")), onAssign && !cmMode && /*#__PURE__*/_react.default.createElement(ButtonTooltip, {
    type: 'Dispatch'
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "link-button",
    onClick: () => onAssign('Dispatch'),
    disabled: !privileges.Dispatch || disableButtons
  }, "Dispatch"))), onToggle && /*#__PURE__*/_react.default.createElement(_icons.ExpandAltOutlined, {
    style: {
      cursor: 'pointer'
    },
    onClick: onToggle
  }), onCloseEdit && /*#__PURE__*/_react.default.createElement(_icons.CloseOutlined, {
    title: "Close",
    style: {
      cursor: 'pointer'
    },
    onClick: onCloseEdit
  })));
};
function CMEdit(_ref3) {
  let {
    data,
    prevValue,
    selectedData,
    error,
    edit,
    setEdit,
    showTable,
    setError,
    onUpdate,
    onLink,
    onToggle,
    onAssign,
    metadata,
    privileges,
    editDisabledStates,
    reOpenStateDuration,
    onCloseEdit,
    attId,
    caseLoading,
    caseError,
    setCurrentCase,
    postCasesSearch,
    setRecentActivity,
    onCancelEdit,
    tabKey,
    onTabChange,
    onEditValuesChange,
    customerInfo,
    customerInfoLoading,
    customerInfoError,
    cmMode,
    accountStatuses,
    bridgePayStatuses,
    caseUpdateLoading,
    onClaim,
    caseCategoriesConfig,
    selectedRows
  } = _ref3;
  // Disable the fields and buttons based on the State and re open duration
  const disableFields = editDisabledStates.includes(data?.caseHistory[0]?.state) && data?.caseHistory[0]?.updatedAt && (0, _diffDays.default)(data?.caseHistory[0]?.updatedAt) < reOpenStateDuration || !privileges.Edit && privileges.Close;
  const disableButtons = editDisabledStates.includes(data?.caseHistory[0]?.state);
  const disableAllFieldsExceptNotes = data?.caseHistory[0]?.assignedTo !== attId || cmMode;
  const handleUpdate = value => {
    onUpdate?.(value);
  };
  (0, _react.useEffect)(() => {
    if (data?.caseId !== selectedData?.caseId) {
      setCurrentCase(null);
      postCasesSearch({
        caseId: selectedData?.caseId
      }, selectedData?.billingAccountNumber);
      setRecentActivity(selectedData?.caseId, selectedData?.billingAccountNumber);
    }
  }, [selectedData]);
  const handleCloseEdit = () => {
      if (!showTable) {
        onToggle();
      }
      onCloseEdit();
    },
    items = [{
      label: 'Case Detail',
      key: 'detail',
      children: data?.sacCode ? /*#__PURE__*/_react.default.createElement(_CaseDetail.EBBCaseDetail, {
        data: data,
        loading: customerInfoLoading,
        customerInfo: customerInfo,
        customerInfoError: customerInfoError,
        prevValue: prevValue,
        error: error,
        isEdit: edit,
        onUpdate: value => handleUpdate(value),
        onCancel: () => onCancelEdit(),
        metadata: metadata,
        privileges: privileges,
        disableFields: disableFields,
        disableAllFieldsExceptNotes: disableAllFieldsExceptNotes,
        attId: attId,
        onEditValuesChange: value => onEditValuesChange(value),
        cmMode: cmMode,
        accountStatuses: accountStatuses,
        bridgePayStatuses: bridgePayStatuses,
        caseUpdateLoading: caseUpdateLoading,
        caseCategoriesConfig: caseCategoriesConfig
      }) : /*#__PURE__*/_react.default.createElement(_CaseDetail.CaseDetail, {
        data: data,
        loading: customerInfoLoading,
        customerInfo: customerInfo,
        customerInfoError: customerInfoError,
        prevValue: prevValue,
        error: error,
        isEdit: edit,
        onUpdate: value => handleUpdate(value),
        onCancel: () => onCancelEdit(),
        metadata: metadata,
        privileges: privileges,
        disableFields: disableFields,
        disableAllFieldsExceptNotes: disableAllFieldsExceptNotes,
        attId: attId,
        onEditValuesChange: value => onEditValuesChange(value),
        cmMode: cmMode,
        accountStatuses: accountStatuses,
        bridgePayStatuses: bridgePayStatuses,
        caseUpdateLoading: caseUpdateLoading,
        caseCategoriesConfig: caseCategoriesConfig
      })
    }, {
      label: 'Case Timeline',
      key: 'timeline',
      children: /*#__PURE__*/_react.default.createElement(_caseTimeline.default, {
        data: data,
        caseHistory: data?.caseHistory,
        caseError: caseError,
        showTable: showTable
      })
    }];
  return caseLoading ? /*#__PURE__*/_react.default.createElement("div", {
    className: "case-loading"
  }, /*#__PURE__*/_react.default.createElement(_antd.Spin, {
    tip: "Loading..."
  })) : caseError && !data?.caseId ? /*#__PURE__*/_react.default.createElement("div", {
    className: "case-error"
  }, /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    type: "error",
    className: "alert-error",
    message: caseError || 'Error loading the case',
    closable: true,
    onClose: () => handleCloseEdit()
  }), /*#__PURE__*/_react.default.createElement(_icons.CloseOutlined, {
    title: "Close",
    style: {
      cursor: 'pointer'
    },
    onClick: onCloseEdit
  })) : data?.caseId ? /*#__PURE__*/_react.default.createElement("div", {
    className: "cm-edit-wrapper",
    key: data?.caseId
  }, /*#__PURE__*/_react.default.createElement(_antd.Tabs, {
    defaultActiveKey: "detail",
    activeKey: tabKey,
    onChange: key => onTabChange(key),
    tabBarExtraContent: {
      right: /*#__PURE__*/_react.default.createElement(RightTabActions, {
        data: data,
        onEdit: edit ? null : () => {
          setEdit(true);
          onTabChange('detail');
        },
        onLink: onLink,
        onAssign: type => onAssign(type, data),
        onLaunch: () => {},
        onCloseEdit: () => handleCloseEdit(),
        onClaim: () => onClaim(data),
        onToggle: onToggle,
        privileges: privileges,
        disableButtons: disableButtons,
        disableEdit: disableFields ? false : disableButtons ? true : false,
        attId: attId,
        cmMode: cmMode,
        selectedRows: selectedRows
      })
    },
    items: items
  })) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, " Error loading the case");
}
module.exports = exports.default;