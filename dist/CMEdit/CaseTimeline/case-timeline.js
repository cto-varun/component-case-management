"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CaseTimeline;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _Content = _interopRequireDefault(require("./Content"));
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Step
} = _antd.Steps;
function CaseTimeline(_ref) {
  let {
    data,
    caseHistory,
    caseError,
    showTable
  } = _ref;
  const [current, setCurrent] = (0, _react.useState)(0);
  const stepData = [...caseHistory]?.reverse();
  const nextStep = () => {
    const Ncurr = current + 1;
    setCurrent(Ncurr);
  };
  const prevStep = () => {
    const Pcurr = current - 1;
    setCurrent(Pcurr);
  };
  const handleChange = current => {
    setCurrent(current);
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "case-detail-data",
    style: {
      display: 'grid',
      gridTemplateColumns: showTable ? 'auto' : '30% auto'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Steps, {
    progressDot: true,
    current: current,
    size: "default",
    className: "progressDots",
    direction: showTable ? 'horizontal' : 'vertical',
    onChange: value => handleChange(value)
  }, stepData.map((step, index) => /*#__PURE__*/_react.default.createElement(Step, {
    key: index,
    title: step?.status?.toUpperCase(),
    description: `Updated ${(0, _moment.default)(step?.updatedAt).format('DD MMM YYYY, h:mm a')}`
  }))), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      padding: '1%'
    }
  }, current > 0 && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "dashed",
    onClick: prevStep,
    className: "navigation-button-left"
  }, /*#__PURE__*/_react.default.createElement(_antd.Icon, {
    type: "left"
  }), "Previous"), current + 1 < stepData.length && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "dashed",
    onClick: nextStep
  }, "Next", /*#__PURE__*/_react.default.createElement(_antd.Icon, {
    type: "right"
  })), /*#__PURE__*/_react.default.createElement(_Content.default, {
    data: data,
    caseHistory: stepData,
    index: current
  })));
}
module.exports = exports.default;