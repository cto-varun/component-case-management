"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EBBCaseDetail;
var _react = _interopRequireWildcard(require("react"));
var _componentNotes = _interopRequireDefault(require("@ivoyant/component-notes"));
var _antd = require("antd");
var _RowItem = _interopRequireDefault(require("./RowItem"));
var _CustomerDetailBar = _interopRequireDefault(require("../CustomerDetailBar"));
var _moment = _interopRequireDefault(require("moment"));
var _stateList = _interopRequireDefault(require("./stateList"));
var _shortid = _interopRequireDefault(require("shortid"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function EBBCaseDetail(_ref) {
  let {
    data,
    error,
    isEdit,
    onUpdate,
    onCancel,
    metadata,
    privileges,
    disableFields,
    disableAllFieldsExceptNotes,
    attId,
    prevValue,
    onEditValuesChange,
    customerInfo,
    loading,
    customerInfoError,
    cmMode,
    accountStatuses,
    bridgePayStatuses,
    caseUpdateLoading,
    caseCategoriesConfig
  } = _ref;
  const [form] = _antd.Form.useForm();
  const intialData = {
    caseId: data?.caseId,
    updatedBy: attId,
    summary: '',
    status: data?.caseHistory[0]?.status,
    state: data?.caseHistory[0]?.state,
    category: data.category || data?.caseHistory[0]?.category,
    priority: data?.caseHistory[0]?.priority,
    subCategory1: data?.subCategory1 || data?.caseHistory[0]?.subCategory1,
    subCategory2: data?.subCategory2 || data?.caseHistory[0]?.subCategory2,
    estimatedResolutionTime: data?.caseHistory[0]?.estimatedResolutionTime,
    additionalProperties: data?.caseHistory[0]?.additionalProperties || {},
    resolution: null
  };
  const formData = data?.caseId === prevValue?.caseEditValues?.caseId ? prevValue?.caseEditValues : intialData;
  const [values, setValues] = (0, _react.useState)(formData);
  const [errorNotes, setErrorNotes] = (0, _react.useState)(null);
  const getOptions = domain => {
    const options = metadata?.find(item => item.domain === domain)?.metadata?.categories?.map(category => {
      return {
        value: category?.name,
        label: category?.name
      };
    });
    return options;
  };
  const getCategoryOptions = categoryMetadata => {
    const options = categoryMetadata?.map(category => {
      return {
        value: category?.name,
        label: category?.name
      };
    });
    return options;
  };
  const categoryOptions = getOptions('cases');
  const casesMetaData = metadata?.find(item => item.domain === 'cases')?.metadata?.categories;
  const subCategory1MetaData = casesMetaData?.find(item => item.name === values.category)?.categories;
  const subCategory1Options = getCategoryOptions(subCategory1MetaData);
  const subCategory2MetaData = subCategory1MetaData?.find(item => item.name === values.subCategory1)?.categories;
  const subCategory2Options = getCategoryOptions(subCategory2MetaData);
  let statusOptions = getOptions('caseStatuses');
  const priorityOptions = getOptions('casePriorities');

  // Account metadata
  const accountMetaData = metadata?.find(item => item.domain === 'account')?.metadata?.categories;
  const accountTypeMetadata = accountMetaData?.find(item => item.name === 'accountType')?.categories;
  const accountSubTypeMetadata = accountMetaData?.find(item => item.name === 'accountSubType')?.categories;
  const resolutionCodes = getOptions('caseResolutionCodes');

  // Return the state options by privileges
  const caseStateFilter = value => {
    let bool = true;
    if (value === 'Resolved' && !privileges.Resolve || value === 'Closed' && !privileges.Close) {
      bool = false;
    }
    if (!privileges.Edit && privileges.Close || !privileges.Edit && privileges.Resolve) {
      if (value === 'Rejected') {
        bool = false;
      }
    }
    return bool;
  };
  const caseStateOptions = getOptions('caseStates').filter(_ref2 => {
    let {
      value
    } = _ref2;
    return caseStateFilter(value);
  });
  const handleUpdate = () => {
    if (JSON.stringify(intialData) !== JSON.stringify(values) && values.summary) {
      if (!values?.resolution) {
        delete values.resolution;
      }
      if (values?.estimatedResolutionTime) {
        values.estimatedResolutionTime = getDateFormat(values.estimatedResolutionTime);
      }
      if (data?.caseHistory[0]?.assignedTo) {
        values.assignedTo = data?.caseHistory[0]?.assignedTo;
      }
      if (data?.caseHistory[0]?.assignedTeam) {
        values.assignedTeam = data?.caseHistory[0]?.assignedTeam;
      }
      if (data?.caseHistory[0]?.state === 'NEW' && values.state === 'NEW') {
        values.state = 'Open';
      }
      onUpdate && onUpdate(values);
      setErrorNotes(null);
    }
  };
  const handleChange = (name, value) => {
    if (value === 'Closed' && (name === 'state' || name === 'status')) {
      setValues({
        ...values,
        state: value,
        status: value
      });
      form.setFieldsValue({
        state: value,
        status: value
      });
      onEditValuesChange({
        ...values,
        state: value,
        status: value
      });
    } else {
      setValues({
        ...values,
        [name]: value
      });
      onEditValuesChange({
        ...values,
        [name]: value
      });
    }
  };
  const getDateFormat = value => {
    let convertDate = new Date(value)?.toISOString()?.replace('T', ' ').split('.')[0];
    let date = `${convertDate}+0000`;
    return date;
  };
  const handleDateChange = (name, value) => {
    const date = value && getDateFormat(value);
    date && handleChange(name, date);
  };
  const handleFormFailed = () => {
    !values.summary && setErrorNotes(true);
  };
  const getAccountsType = (data, name) => {
    return data?.find(item => item.name === name)?.description;
  };
  const interactionIds = data?.interactions?.map(_ref3 => {
    let {
      interactionId
    } = _ref3;
    return interactionId;
  });
  const handleChangeAdditionalProps = (value, key, type) => {
    if (type === 'DatePicker') {
      value = (0, _moment.default)().format('YYYY-MM-DD HH:mm:ssZZ');
    }
    setValues({
      ...values,
      additionalProperties: {
        ...values?.additionalProperties,
        [key]: value
      }
    });
  };
  let additionalPropertiesArray = [];
  data?.caseHistory[0]?.additionalProperties && Object.entries(data?.caseHistory[0]?.additionalProperties)?.forEach(_ref4 => {
    let [key, value] = _ref4;
    additionalPropertiesArray.push({
      key: key,
      value: value
    });
  });
  const handleEBBUpdate = () => {
    sessionStorage.setItem('ebbTable', true);
    const win = window.open(`/`, '_blank');
    win.focus();
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "case-detail-data",
    key: data.caseId
  }, /*#__PURE__*/_react.default.createElement(_CustomerDetailBar.default, {
    data: data,
    customerInfo: customerInfo,
    loading: loading,
    customerInfoError: customerInfoError,
    cmMode: cmMode,
    accountStatuses: accountStatuses,
    bridgePayStatuses: bridgePayStatuses
  }), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      marginTop: 16
    }
  }, isEdit ? /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 24,
    direction: "vertical",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Form, {
    name: "case-update",
    form: form,
    initialValues: formData,
    onFinish: handleUpdate,
    layout: "vertical",
    onFinishFailed: handleFormFailed
  }, /*#__PURE__*/_react.default.createElement(_antd.Card, {
    className: "edit-wrapper"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 30,
    className: "edit-boxes-wrapper",
    style: {
      width: '100%',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Category",
    name: "category"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.category,
    style: {
      width: 310
    },
    onChange: value => handleChange('category', value),
    placeholder: "Category",
    disabled: disableFields || disableAllFieldsExceptNotes
  }, categoryOptions?.map(item => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: item.value,
    key: item.value
  }, item.label)))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Sub Category 1",
    name: "subCategory1"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.subCategory1,
    style: {
      width: 310
    },
    onChange: value => handleChange('subCategory1', value),
    placeholder: "SubCategory1",
    disabled: !subCategory1MetaData,
    disabled: disableFields || disableAllFieldsExceptNotes
  }, subCategory1Options?.map(item => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: item.value,
    key: item.value
  }, item.label)))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Sub Category 2",
    name: "subCategory2"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.subCategory2,
    style: {
      width: 310
    },
    onChange: value => handleChange('subCategory2', value),
    placeholder: "SubCategory2",
    disabled: disableFields || disableAllFieldsExceptNotes
  }, subCategory2Options?.map(item => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: item.value,
    key: item.value
  }, item.label)))), /*#__PURE__*/_react.default.createElement("div", {
    class: "ant-space-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    class: "ant-row ant-form-item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    class: "ant-col ant-form-item-label"
  }, /*#__PURE__*/_react.default.createElement("label", {
    for: "case-update_ETR",
    class: "",
    title: "ETR"
  }, "Estimated Resolution Time")), /*#__PURE__*/_react.default.createElement(_antd.DatePicker, {
    placeholder: "ETR",
    defaultValue: values?.estimatedResolutionTime ? (0, _moment.default)(new Date(values?.estimatedResolutionTime)) : '',
    onChange: date => handleDateChange('estimatedResolutionTime', date),
    format: 'DD MMM YYYY',
    style: {
      width: 220
    },
    disabled: disableFields || disableAllFieldsExceptNotes
  }))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Status",
    name: "status"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.status,
    placeholder: "Status",
    style: {
      width: 310
    },
    onChange: value => handleChange('status', value),
    disabled: disableFields || disableAllFieldsExceptNotes
  }, statusOptions?.map(item => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: item.value,
    key: item.value
  }, item.label)))), values.status === 'Upload to NLAD' && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      color: '#237804',
      backgroundColor: '#F6FFED'
    },
    onClick: handleEBBUpdate
  }, "Upload"), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Priority",
    name: "priority"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.priority,
    placeholder: "Priority",
    style: {
      width: 170
    },
    onChange: value => handleChange('priority', value),
    disabled: disableFields || disableAllFieldsExceptNotes
  }, priorityOptions?.map(item => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: item.value,
    key: item.value
  }, item.label)))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Case Condition",
    name: "state"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.state,
    placeholder: "Case Condition",
    style: {
      width: 200
    },
    onChange: value => handleChange('state', value),
    disabled: disableAllFieldsExceptNotes
  }, caseStateOptions?.map(item => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
    value: item.value,
    key: item.value
  }, item.label)))), data?.caseHistory[0]?.state !== 'Closed' && (values.state === 'Closed' || values.status === 'Closed') && /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Resolution Code",
    name: "resolution",
    rules: [{
      required: true,
      message: 'Please select the resolution code!'
    }]
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    value: values.resolution,
    placeholder: "Select Resolution Code",
    style: {
      width: 444
    },
    onChange: value => handleChange('resolution', value),
    disabled: disableAllFieldsExceptNotes
  }, resolutionCodes?.map(_ref5 => {
    let {
      value,
      label
    } = _ref5;
    return /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
      value: value,
      key: value
    }, label);
  })))), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 30,
    className: "edit-boxes-wrapper",
    style: {
      width: '100%',
      flexWrap: 'wrap'
    }
  }, values?.category && caseCategoriesConfig[values?.category]?.map(_ref6 => {
    let {
      type,
      label,
      name,
      options,
      ...props
    } = _ref6;
    switch (type) {
      case 'Input':
        return /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          label: label,
          key: _shortid.default.generate()
        }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
          style: {
            width: 220,
            marginTop: 8,
            marginRight: 8
          },
          value: values?.additionalProperties[name],
          name: name,
          label: label,
          onChange: e => handleChangeAdditionalProps(e.target.value, name),
          disabled: disableFields || disableAllFieldsExceptNotes
          // {...props}
        }));

      case 'DatePicker':
        return /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          label: label,
          key: _shortid.default.generate()
        }, /*#__PURE__*/_react.default.createElement(_antd.DatePicker, {
          placeholder: label,
          defaultValue: values?.additionalProperties[name] ? (0, _moment.default)(new Date(values?.additionalProperties[name])) : '',
          onChange: date => handleChangeAdditionalProps(date, name, type),
          format: "YYYY-MM-DD h:mm A",
          use12Hours: true,
          showTime: true,
          style: {
            width: 220,
            marginTop: 8,
            marginRight: 8
          },
          disabled: disableFields || disableAllFieldsExceptNotes
        }));
      case 'Select':
        const newOptions = name === 'state' ? _stateList.default : options;
        return /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          label: label,
          key: _shortid.default.generate(),
          style: {
            width: 220,
            marginTop: 8,
            marginRight: 8
          }
        }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
          value: values?.additionalProperties[name],
          showSearch: true,
          optionFilterProp: "children",
          onChange: value => handleChangeAdditionalProps(value, name),
          filterOption: (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
          disabled: disableFields || disableAllFieldsExceptNotes
        }, newOptions.map((option, index) => /*#__PURE__*/_react.default.createElement(_antd.Select.Option, {
          value: option.value,
          key: index
        }, option.label))));
      case 'CheckBox':
        return /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
          key: _shortid.default.generate(),
          style: {
            width: 220,
            marginTop: 36,
            marginRight: 8
          }
        }, /*#__PURE__*/_react.default.createElement(_antd.Checkbox, {
          checked: values?.additionalProperties[name] === 'true' ? true : false,
          onChange: e => handleChangeAdditionalProps(e.target.checked ? 'true' : 'false', name),
          disabled: disableFields || disableAllFieldsExceptNotes
        }, label));
      default:
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
    }
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "edit-row-item"
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Notes",
    name: "summary",
    rules: [{
      required: true,
      message: 'Please enter notes!'
    }]
  }, /*#__PURE__*/_react.default.createElement(_componentNotes.default, {
    style: {
      height: 130,
      marginBottom: 48,
      width: 'calc(100% - 300px)'
    },
    className: !values.summary && errorNotes && 'quill-error',
    theme: "snow",
    value: values.summary || '',
    onChange: value => handleChange('summary', value)
  }))), error && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: error,
    type: "error"
  })), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 10
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "submit-button",
    htmlType: "submit",
    loading: caseUpdateLoading
  }, "Update"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "cancel-button",
    onClick: onCancel
  }, "Cancel")))) : /*#__PURE__*/_react.default.createElement("div", {
    className: "view-wrapper d-flex flex-row"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-column"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    className: "d-flex align-items-center category-tags",
    size: 6
  }, values.category && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#E4F5DE"
  }, values.category), values.subCategory1 && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#D6E4FF"
  }, values.subCategory1), values.subCategory2 && /*#__PURE__*/_react.default.createElement(_antd.Tag, {
    color: "#D6E4FF"
  }, values.subCategory2)), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row flex-wrap",
    style: {
      justifyContent: 'flex-start'
    }
  }, /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Status",
    content: values.status
  }), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Priority",
    content: values.priority
  }), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Case Condition",
    content: values.state
  }), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Interaction Type",
    content: data.caseSource
  }), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Account Type",
    content: getAccountsType(accountTypeMetadata, data?.accountType) || 'Individual'
  }), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Account Sub Type",
    content: getAccountsType(accountSubTypeMetadata, data?.accountSubType) || 'N/A'
  }), data?.caseHistory[0]?.assignedTeam && /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Case Queue",
    content: data?.caseHistory[0]?.assignedTeam
  }), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "ETR",
    content: data.caseHistory[0]?.estimatedResolutionTime ? new Date(data?.caseHistory[0]?.estimatedResolutionTime).toLocaleString() : 'N/A'
  }), interactionIds && interactionIds?.length > 0 && /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Interaction Id's",
    content: interactionIds?.join(',')
  }), additionalPropertiesArray?.map(_ref7 => {
    let {
      key,
      value
    } = _ref7;
    return /*#__PURE__*/_react.default.createElement(_RowItem.default, {
      key: _shortid.default.generate(),
      title: key.charAt(0).toUpperCase() + key.slice(1),
      content: value
    });
  })), /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Description",
    content: data?.description || 'N/A',
    isHtml: true
  }), (data?.caseHistory[0]?.summary || data?.caseHistory[0]?.resolution) && /*#__PURE__*/_react.default.createElement(_RowItem.default, {
    title: "Latest Notes",
    className: "row-margin-top",
    content: data?.caseHistory[0]?.summary || data?.caseHistory[0]?.resolution || 'N/A',
    isHtml: true
  })))));
}
module.exports = exports.default;