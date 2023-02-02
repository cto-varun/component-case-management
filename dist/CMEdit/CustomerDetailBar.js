"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CustomerDetailBar;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const {
  Paragraph
} = _antd.Typography;
const strings = {
  nA: 'N/A',
  ebbEmergencyBroadband: 'EBB Emergency Broadband',
  searchCustomer: 'searchCustomer',
  custAuth: 'custAuth',
  ebbProgram: 'ebbProgram'
};
const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;
const getAdditionalProperties = data => data?.caseHistory[0]?.additionalProperties;
const getNameProperties = data => data?.name;
function isEBBFn(data, ban) {
  return ban === strings.nA && data?.caseHistory[0]?.category === strings.ebbEmergencyBroadband;
}
function getAccountFullName(data, customerInfo) {
  const additionalProperties = getAdditionalProperties(data);
  return additionalProperties?.firstName ? getFullName(additionalProperties.firstName, additionalProperties.lastName) : getFullName(getNameProperties(customerInfo)?.firstName, getNameProperties(customerInfo)?.lastName);
}
function getValues(data, customerInfo) {
  const additionalProperties = getAdditionalProperties(data);
  return {
    ban: data?.billingAccountNumber,
    ctn: data?.phoneNumber,
    accountName: getAccountFullName(data, customerInfo),
    firstName: additionalProperties?.firstName || getNameProperties(customerInfo)?.firstName,
    lastName: additionalProperties?.lastName || getNameProperties(customerInfo)?.lastName,
    banStatus: customerInfo?.accountDetails?.banStatus,
    state: additionalProperties?.state || customerInfo?.billingAddress?.state
  };
}
function handleClick(data, customerInfo, isEBB) {
  const values = getValues(data, customerInfo);
  sessionStorage.removeItem(strings.searchCustomer);
  sessionStorage.removeItem(isEBB ? strings.custAuth : strings.ebbProgram);
  sessionStorage.setItem(isEBB ? strings.ebbProgram : strings.custAuth, JSON.stringify(values));
  window.open(`/`, '_blank');
  window.focus();
}
function CustomerDetailBar(_ref) {
  let {
    data,
    customerInfo,
    loading,
    customerInfoError,
    cmMode,
    accountStatuses,
    bridgePayStatuses
  } = _ref;
  const ban = data?.billingAccountNumber;
  const ebb = isEBBFn(data, ban);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 24,
    className: "meta-data"
  }, /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      display: 'flex'
    },
    copyable: {
      text: data.caseId
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "id-wrapper"
  }, data.caseId)), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 20
  }, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, data?.phoneNumber && /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      display: 'flex'
    },
    copyable: {
      text: data.phoneNumber
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, "CTN : ", data.phoneNumber)), (ban && ban !== 'N/A' || ebb) && /*#__PURE__*/_react.default.createElement(Paragraph, {
    style: {
      display: 'flex'
    },
    copyable: {
      text: ban
    }
  }, !ebb && (ban?.includes('C') || ban && isNaN(ban)) ? /*#__PURE__*/_react.default.createElement("div", null, "BAN : ", ban) : /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    title: ebb ? 'Open EBB form in new tab' : 'Manage account in new tab'
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "link",
    onClick: () => handleClick(data, customerInfo, ebb)
  }, ban && ban !== 'N/A' ? `BAN : ${ban}` : ebb ? 'Go to EBB' : '')))), /*#__PURE__*/_react.default.createElement("div", null, "Created on : ", new Date(data.createdAt).toLocaleString()), /*#__PURE__*/_react.default.createElement("div", null, "Last Updated on :", ' ', data.caseHistory[0]?.updatedAt ? new Date(data.caseHistory[0]?.updatedAt).toLocaleString() : 'N/A'), data?.caseHistory[0]?.estimatedResolutionTime && /*#__PURE__*/_react.default.createElement("div", null, "Estimated Completion :", ' ', new Date(data.caseHistory[0]?.estimatedResolutionTime).toLocaleString()), /*#__PURE__*/_react.default.createElement("div", null, "Updated By :", ' ', data?.caseHistory[0]?.updatedBy || data?.createdBy || 'N/A'), /*#__PURE__*/_react.default.createElement("div", null, "Assigned To :", ' ', data.caseHistory[0]?.assignedTo ? data.caseHistory[0]?.assignedTo : ''))), !cmMode && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, loading ? /*#__PURE__*/_react.default.createElement("div", {
    className: "case-loading"
  }, /*#__PURE__*/_react.default.createElement(_antd.Spin, null)) : customerInfoError ? /*#__PURE__*/_react.default.createElement("div", {
    style: {
      color: 'red',
      margin: 12
    }
  }, customerInfoError) : customerInfo && /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 30,
    className: "meta-data"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 52
  }, /*#__PURE__*/_react.default.createElement("div", null, "Name : ", customerInfo?.name?.firstName, ' ', customerInfo?.name?.lastName), /*#__PURE__*/_react.default.createElement("div", null, "Account Status :", ' ', customerInfo?.accountDetails?.banStatus ? accountStatuses[customerInfo?.accountDetails?.banStatus] : 'N/A'), /*#__PURE__*/_react.default.createElement("div", null, "AR Balance : $", customerInfo?.accountDetails?.arBalance !== undefined && customerInfo?.accountDetails?.arBalance !== '' && customerInfo?.accountDetails?.arBalance !== null ? customerInfo?.accountDetails?.arBalance : 'N/A'), /*#__PURE__*/_react.default.createElement("div", null, "Due by :", ' ', customerInfo?.accountDetails?.billCycleDate ? (0, _moment.default)(customerInfo?.accountDetails?.billCycleDate).subtract(1, 'days').format('MM/DD/YYYY') : 'N/A'), /*#__PURE__*/_react.default.createElement("div", null, "Bill Cycle Date :", ' ', customerInfo?.accountDetails?.billCycleDate ? (0, _moment.default)(customerInfo?.accountDetails?.billCycleDate).format('MM/DD/YYYY') : 'N/A'), /*#__PURE__*/_react.default.createElement("div", null, "Bridge Pay Status :", ' ', customerInfo?.bridgePayDetails?.bridgePayList?.length > 0 ? bridgePayStatuses[customerInfo?.bridgePayDetails?.bridgePayList[0]?.status] : 'None')))));
}
module.exports = exports.default;