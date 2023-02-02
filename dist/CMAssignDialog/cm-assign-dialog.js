"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CMAssignDialog;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _componentNotes = _interopRequireDefault(require("@ivoyant/component-notes"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Option
} = _antd.AutoComplete;
function CMAssignDialog(_ref) {
  let {
    type,
    visible,
    error,
    onAssign,
    onCancel,
    data,
    metadata,
    privilegesOptions,
    isBulk,
    assignDispatchWorkflow,
    datasources,
    selectedRowKeys,
    setSelectedRowKeys,
    setEdit,
    setEditRow,
    setAssignRow,
    setCaseUpdateLoading,
    errorOnBulkHit,
    searchUsersWorkflow,
    selectedRows
  } = _ref;
  const currentProfile = window[sessionStorage.tabId].COM_IVOYANT_VARS?.profile;
  const [form] = _antd.Form.useForm();
  const [queue, setQueue] = (0, _react.useState)(data?.caseHistory[0]?.assignedTeam || '');
  const [note, setNote] = (0, _react.useState)('');
  const assignedTo = data?.caseHistory[0]?.assignedTo || data?.agentName;
  const [value, setValue] = (0, _react.useState)('');
  const [errorMessage, setErrorMessage] = (0, _react.useState)(null);
  const [noteErrorMessage, setNoteErrorMessage] = (0, _react.useState)(null);
  const [apiError, setApiError] = (0, _react.useState)(null);
  const [searchNameResults, setSearchNameResults] = (0, _react.useState)([]);
  const [searchIdResults, setSearchIdResults] = (0, _react.useState)([]);
  const [errorText, setErrorText] = (0, _react.useState)();
  const [currentValue, setCurrentValue] = (0, _react.useState)({
    id: '',
    name: ''
  });
  const [onBulkResponse, setOnBulkResponse] = (0, _react.useState)(false);
  let {
    attId
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;

  // fetching result for current profile for checking if dispatching without notes is enabled or not
  let dispatchWithoutNotes = metadata?.find(mt => mt.domain === 'profiles')?.metadata?.categories?.find(ct => ct?.name === currentProfile)?.categories?.find(ct => ct?.name === 'dispatchCaseWithoutNotes' && (ct?.enable === true || ct?.enable === 'true'));
  const dispatchQueues = privilegesOptions?.categories?.find(_ref2 => {
    let {
      dispatchTo
    } = _ref2;
    return dispatchTo;
  })?.dispatchTo;
  let dispatchCategories = metadata?.find(item => item.domain === 'cases')?.metadata?.categories?.find(_ref3 => {
    let {
      name
    } = _ref3;
    return name === data?.caseHistory?.length && data?.caseHistory[0]?.category;
  })?.dispatchTo?.map(name => {
    return {
      value: name,
      label: name
    };
  });

  // Queue options from caseprivileges or else caseAssignedTeam
  const intialQueueOptions = dispatchQueues ? dispatchQueues?.map(name => {
    return {
      value: name,
      label: name
    };
  }) : metadata?.find(item => item.domain === 'caseAssignedTeam')?.metadata?.categories?.map(category => {
    return {
      value: category?.name,
      label: category?.name
    };
  }) || [];
  var namesOfCategories = new Set(intialQueueOptions.map(_ref4 => {
    let {
      value
    } = _ref4;
    return value;
  }));
  const queueOptions = dispatchCategories?.length ? [...intialQueueOptions, ...dispatchCategories.filter(_ref5 => {
    let {
      value
    } = _ref5;
    return !namesOfCategories.has(value);
  })] : intialQueueOptions;
  const handleChangeQueue = value => {
    setErrorMessage(null);
    setQueue(value);
  };
  const handleChangeValue = (type, value, option) => {
    if (type === 'attId') {
      setSearchNameResults([]);
    } else {
      setSearchIdResults([]);
    }
    setErrorText({});
    setCurrentValue({
      name: option.key,
      attId: option.value
    });
    setErrorMessage(null);
    setValue({
      name: option.key,
      attId: option.value
    });
  };
  const handleSearchUsersResponse = (successStates, errorStates, type) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = eventData.event.data.data;
        if (type === 'attId') {
          setSearchIdResults(response);
        } else {
          setSearchNameResults(response);
        }
      }
      if (isFailure) {
        if (type === 'attId') {
          setSearchIdResults([]);
          setErrorText({
            id: eventData.event.data.message
          });
        } else {
          setSearchNameResults([]);
          setErrorText({
            name: eventData.event.data.message
          });
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const handleSearchUsers = (type, value) => {
    if (type === 'attId' && value?.length >= 4 || type === 'name' && value?.length >= 3) {
      const requestBody = JSON.stringify(type === 'attId' ? {
        attId: value
      } : {
        name: value
      });
      const submitEvent = 'SUBMIT';
      const {
        workflow,
        datasource,
        successStates,
        errorStates,
        responseMapping
      } = searchUsersWorkflow;
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: workflow,
          workflow: workflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleSearchUsersResponse(successStates, errorStates, type));
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
        header: {
          registrationId: workflow,
          workflow: workflow,
          eventType: submitEvent
        },
        body: {
          datasource: datasources[datasource],
          request: {
            body: requestBody
          },
          responseMapping
        }
      });
    }
  };
  function showModal(msg) {
    _antd.Modal.confirm({
      title: 'Confirm',
      content: msg,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        bulkAssign();
      }
    });
  }
  const getProfileAuthentication = () => {
    if (!dispatchWithoutNotes) {
      if (note) return true;else return false;
    } else return true;
  };
  const handleUpdate = () => {
    if (isBulk) {
      if (type === 'Dispatch' && queue && getProfileAuthentication() || type === 'Assign' && value?.attId && note || type === 'Claim' && note) {
        if (type === 'Claim') {
          let isAlreadyAssigned = false;
          for (const currentRow of selectedRows) {
            if (currentRow?.assignedTo) {
              isAlreadyAssigned = true;
            }
          }
          if (isAlreadyAssigned) {
            showModal('One or more cases you selected are claimed by another user, do you want to proceed?');
          } else {
            bulkAssign();
          }
        } else {
          bulkAssign();
        }
      } else {
        if (type === 'Assign' && !value?.attId) setErrorMessage('Please assign to someone!');else if (type === 'Dispatch' && !queue) setErrorMessage('Please select the queue');else if (type === 'Claim' && !note) setNoteErrorMessage('Note is required');else if (!note) setNoteErrorMessage('Notes is required');
      }
    } else {
      if (type === 'Dispatch' && queue && getProfileAuthentication() && queue !== data?.caseHistory[0]?.assignedTeam || type === 'Assign' && value?.attId && note) {
        onAssign && onAssign({
          caseId: data.caseId,
          updatedBy: attId,
          summary: note || data?.caseHistory[0]?.summary || data.description,
          status: data?.caseHistory[0]?.status,
          state: data?.caseHistory[0]?.state,
          priority: data?.caseHistory[0]?.priority,
          assignedTo: type === 'Assign' ? value?.attId : '',
          assignedTeam: type === 'Dispatch' ? queue : data?.caseHistory[0]?.assignedTeam || '',
          category: data.category || data?.caseHistory[0]?.category,
          subCategory1: data.subCategory1 || data?.caseHistory[0]?.subCategory1,
          subCategory2: data.subCategory2 || data?.caseHistory[0]?.subCategory2
        });
      } else {
        if (type === 'Assign' && !value?.attId) {
          setErrorMessage('Please enter new case worker!');
        } else if (type === 'Dispatch' && (!queue || queue === data?.caseHistory[0]?.assignedTeam)) {
          setErrorMessage(queue ? 'Case is already assigned to this queue' : 'Please select the queue');
        } else if (!note) {
          setNoteErrorMessage('Notes is required');
        }
      }
    }
  };
  const handleBulkResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        setOnBulkResponse(eventData?.event?.data?.data);
        // setSelectedRowKeys([]);
        setApiError(null);
      }
      if (isFailure) {
        setApiError(eventData?.event?.data?.message || errorOnBulkHit);
      }
      setCaseUpdateLoading(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  function bulkAssign() {
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = assignDispatchWorkflow;
    const submitEvent = 'SUBMIT';
    setCaseUpdateLoading(true);
    let body = {
      caseIds: selectedRowKeys,
      summary: note,
      assignedTo: type === 'Assign' ? value?.attId || '' : type === 'Claim' ? attId || '' : '',
      assignedTeam: queue || '',
      updatedBy: window[window.sessionStorage?.tabId].COM_IVOYANT_VARS?.attId
    };
    if (type === 'Assign' || type === 'Claim') delete body.assignedTeam;else if (type === 'Dispatch') delete body.assignedTo;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleBulkResponse(successStates, errorStates));
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.').concat(submitEvent), {
      header: {
        registrationId: workflow,
        workflow: workflow,
        eventType: submitEvent
      },
      body: {
        datasource: datasources[datasource],
        request: {
          body: body
        },
        responseMapping
      }
    });
  }
  return /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    className: "cm-assign-case-modal",
    title: /*#__PURE__*/_react.default.createElement("div", {
      className: "cm-assign-case-header"
    }, type, " ", isBulk ? 'Cases' : 'Case'),
    open: visible,
    onCancel: onCancel,
    footer: null,
    width: 780
  }, /*#__PURE__*/_react.default.createElement(_antd.Form, {
    name: "case-assign",
    form: form,
    layout: "vertical"
  }, !isBulk ? /*#__PURE__*/_react.default.createElement("div", {
    className: "meta-data d-flex flex-row align-items-center"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "id-wrapper",
    style: {
      marginRight: 24
    }
  }, "# ", data.caseId), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center",
    style: {
      flex: 1,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/_react.default.createElement("div", null, "CTN : ", data.phoneNumber), /*#__PURE__*/_react.default.createElement("div", null, "BAN : ", data.billingAccountNumber), /*#__PURE__*/_react.default.createElement("div", null, "Created on :", ' ', new Date(data.createdAt).toLocaleString()), /*#__PURE__*/_react.default.createElement("div", null, "Updated By :", ' ', data.caseHistory[0]?.updatedBy || data.createdBy))) : null, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center edit-box-rows"
  }, !isBulk ? /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Owner"
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    value: assignedTo,
    style: {
      width: 80
    },
    readOnly: true
  })) : null, renderRowItem(), value?.name && /*#__PURE__*/_react.default.createElement("div", {
    className: "edit-row-item",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '100%'
    }
  }, "Assigning to : ", value?.name, " (", value?.attId, ")")), /*#__PURE__*/_react.default.createElement("div", {
    className: "edit-row-item",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    label: "Notes",
    name: "Note",
    rules: [{
      required: type === 'Dispatch' && dispatchWithoutNotes ? false : true
    }]
  }, /*#__PURE__*/_react.default.createElement(_componentNotes.default, {
    style: {
      height: 120,
      marginBottom: 48
    },
    theme: "snow",
    value: note,
    onChange: e => {
      setNote(e);
      setNoteErrorMessage(null);
    },
    placeholder: "Enter note ( maximum 1500 characters )"
  }))))), error && /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: error,
    type: "error"
  }), errorMessage && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-error-text "
  }, errorMessage), noteErrorMessage && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-error-text "
  }, noteErrorMessage), apiError && /*#__PURE__*/_react.default.createElement("div", {
    className: "form-error-text "
  }, apiError), renderBulkResponse(), /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row align-items-center justify-content-between action-buttons"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 10
  }, !onBulkResponse ? /*#__PURE__*/_react.default.createElement(_antd.Button, {
    htmlType: "submit",
    className: "submit-button",
    onClick: () => handleUpdate()
  }, type) : null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "cancel-button",
    onClick: onCancel
  }, onBulkResponse ? 'Close' : 'Cancel')))));
  function renderBulkResponse() {
    if (onBulkResponse) {
      return /*#__PURE__*/_react.default.createElement("div", null, Object.keys(onBulkResponse)?.map((status, index) => {
        return /*#__PURE__*/_react.default.createElement("div", {
          key: index
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: `status-text ${status}`
        }, status === 'errors' ? 'Error Cases' : `${status} Cases`), Array.isArray(onBulkResponse[status]) && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, onBulkResponse[status]?.length ? onBulkResponse[status]?.join(', ') : 'None', ' '));
      }));
    }
  }
  function renderRowItem() {
    if (type === 'Assign') {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
        style: {
          marginTop: 24
        },
        label: "Assign by name",
        extra: "Enter minimum 3 characters"
      }, /*#__PURE__*/_react.default.createElement(_antd.AutoComplete, {
        allowClear: true,
        onSearch: value => handleSearchUsers('name', value),
        style: {
          width: 280
        },
        onSelect: (value, option) => handleChangeValue('name', value, option),
        onChange: value => {
          setCurrentValue({
            ...currentValue,
            name: value
          });
        },
        value: currentValue?.name,
        placeholder: "Enter the first name or last name ",
        notFoundContent: errorText?.name
      }, searchNameResults.map(_ref6 => {
        let {
          name,
          attId
        } = _ref6;
        return /*#__PURE__*/_react.default.createElement(Option, {
          key: name,
          value: attId
        }, name, " (", attId, ")");
      }))), /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
        label: "Assign by Id"
      }, /*#__PURE__*/_react.default.createElement(_antd.AutoComplete, {
        allowClear: true,
        onSearch: value => handleSearchUsers('attId', value),
        style: {
          width: 280
        },
        value: currentValue?.attId,
        onChange: value => {
          setCurrentValue({
            ...currentValue,
            attId: value
          });
        },
        notFoundContent: errorText?.id,
        onSelect: (value, option) => handleChangeValue('attId', value, option),
        placeholder: "Enter the attId to search"
      }, searchIdResults.map(_ref7 => {
        let {
          name,
          attId
        } = _ref7;
        return /*#__PURE__*/_react.default.createElement(Option, {
          key: name,
          value: attId
        }, name, " (", attId, ")");
      }))));
    } else if (type === 'Dispatch') {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "edit-row-item"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "edit-row-title"
      }, "Queue"), /*#__PURE__*/_react.default.createElement("div", {
        className: "edit-row-data"
      }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
        value: queue,
        style: {
          width: 200
        },
        placeholder: "Assign Team",
        filterOption: (inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1,
        onChange: value => handleChangeQueue(value),
        showSearch: true,
        optionFilterProp: "children"
      }, queueOptions?.map(_ref8 => {
        let {
          value
        } = _ref8;
        return /*#__PURE__*/_react.default.createElement(Option, {
          value: value
        }, value);
      }))));
    }
  }
}
module.exports = exports.default;