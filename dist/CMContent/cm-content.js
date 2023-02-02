"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CMContent;
var _react = _interopRequireWildcard(require("react"));
var _reactRouterDom = require("react-router-dom");
var _cmEdit = _interopRequireDefault(require("../CMEdit/cm-edit"));
var _cmLinkDialog = _interopRequireDefault(require("../CMLinkDialog/cm-link-dialog"));
var _cmAssignDialog = _interopRequireDefault(require("../CMAssignDialog/cm-assign-dialog"));
var _antd = require("antd");
var _reactSplitPane = _interopRequireDefault(require("react-split-pane"));
var _arrayToValues = _interopRequireDefault(require("../helpers/arrayToValues"));
var _cmTable = _interopRequireDefault(require("../CMTable/cm-table"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentCache = require("@ivoyant/component-cache");
var _lodash = _interopRequireDefault(require("lodash.isequal"));
var _Table = _interopRequireDefault(require("../CMEbb/Table"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* eslint-disable complexity */

function CMContent(_ref) {
  let {
    data,
    datasources,
    properties,
    ...props
  } = _ref;
  const reOpenStateDuration = props?.reOpenStateDuration || properties?.reOpenStateDuration;
  const editDisabledStates = props?.editDisabledStates || properties?.editDisabledStates;
  const recentActivitiesLength = props?.recentActivitiesLength || properties?.recentActivitiesLength;
  const metadata = props?.metadata || data?.data?.metadata || [];
  const {
    searchCasesWorkflow,
    updateCaseWorkflow,
    searchUsersWorkflow,
    customerInfoByQueryWorkflow,
    assignDispatchWorkflow,
    caseCategoriesConfig
  } = properties;
  const caseHistoryMode = props?.metadata || props?.caseHistory;
  const cacheId = !caseHistoryMode ? 'caseManagement' : `caseHistory-${window[window.sessionStorage?.tabId].NEW_BAN}`;
  const prevValue = _componentCache.cache.get(cacheId, {});
  const [assignRow, setAssignRow] = (0, _react.useState)(null);
  const [assignType, setAssignType] = (0, _react.useState)(null);
  const [linkRow, setLinkRow] = (0, _react.useState)(null);
  const [error, setError] = (0, _react.useState)(null);
  const [selectedRowKeys, setSelectedRowKeys] = (0, _react.useState)([]);
  const [currentCase, setCurrentCase] = (0, _react.useState)(prevValue?.currentCase || null);
  const [tabKey, setTabKey] = (0, _react.useState)('detail');
  const [editRow, setEditRow] = (0, _react.useState)(prevValue?.editRow || null);
  const [isEdit, setEdit] = (0, _react.useState)(prevValue?.edit || false);
  const [caseLoading, setCaseLoading] = (0, _react.useState)(true);
  const [tableLoading, setTableLoading] = (0, _react.useState)(false);
  const [caseError, setCaseError] = (0, _react.useState)(null);
  const [getCasesData, setGetCasesData] = (0, _react.useState)(prevValue?.cases || []);
  const [showTable, setShowTable] = (0, _react.useState)(true);
  const location = (0, _reactRouterDom.useLocation)();
  const [emptyText, setEmptyText] = (0, _react.useState)(null);
  const [customerInfoLoading, setCustomerInfoLoading] = (0, _react.useState)(false);
  const [customerInfo, setCustomerInfo] = (0, _react.useState)(prevValue?.customerInfo);
  const [customerInfoError, setCustomerInfoError] = (0, _react.useState)('');
  const [caseUpdateLoading, setCaseUpdateLoading] = (0, _react.useState)(false);
  const [selectedQueue, setSelectedQueue] = (0, _react.useState)(null);
  const [isBulk, setIsBulk] = (0, _react.useState)(false);
  const [selectedRows, setSelectedRows] = (0, _react.useState)([]);
  let {
    profile,
    attId
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
  const [previousPayload, setPreviousPayload] = (0, _react.useState)({
    assignedTo: attId
  });

  /** Makes the search call based on the queue and recenty activity click */
  const filterBySelectedQueue = (subscriptionId, topic, data) => {
    if (data?.body?.selectedQueues?.includes('AssignedToMe')) {
      PostCasesSearch({
        assignedTo: attId
      });
    } else if (data?.body?.selectedQueues) {
      PostCasesSearch({
        assignedTeam: data?.body?.selectedQueues[0]
      });
    }
    if (data?.body?.activity) {
      PostCasesSearch({
        caseId: data?.body?.activity
      });
    }
    handleCloseEdit();
  };

  // Triggers on cm-queue-select and recent activity
  (0, _react.useEffect)(() => {
    _componentMessageBus.MessageBus.subscribe('cm-queue-select', 'CM.QUEUE.SELECT', filterBySelectedQueue);
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('cm-queue-select');
    };
  }, []);

  // Updates the cases data or calls the search API intially and on route change
  (0, _react.useEffect)(() => {
    if (location?.state?.routeData?.searchData) {
      setGetCasesData(JSON.parse(location?.state?.routeData?.searchData));
      setPreviousPayload(location?.state?.routeData?.payload ? JSON.parse(location?.state?.routeData?.payload) : {
        assignedTo: attId
      });
    } else if (location?.state?.routeData?.queueData) {
      handlePostSearch(location?.state?.routeData?.queueData);
    } else {
      if (getCasesData?.length === 0 && !caseHistoryMode) {
        PostCasesSearch({
          assignedTo: attId
        });
      }
      if (getCasesData?.length === 0 && caseHistoryMode) {
        PostCasesSearch({
          billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN
        });
      }
    }
    document.title = 'Case Management - Voyage';
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('SEARCHCASES');
    };
  }, [location]);
  const handleSearchCasesResponse = (successStates, errorStates, caseOnly, refresh) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = eventData.event.data.data;
        if (caseOnly) {
          setCurrentCase(response[0]);
          _componentCache.cache.put(cacheId, {
            ...prevValue,
            currentCase: response[0]
          });
          setCaseLoading(false);
        } else if (refresh) {
          if (!(0, _lodash.default)(response, getCasesData)) {
            _componentCache.cache.put(cacheId, {
              ...prevValue,
              currentCase: response[0]
            });
            setGetCasesData(response);
          } else {
            showSuccessNotification('No new cases found.');
          }
          setTableLoading(false);
        } else {
          setEdit(null);
          setEditRow(null);
          setAssignRow(null);
          setSelectedRowKeys([]);
          setCaseUpdateLoading(false);
          setCustomerInfo(null);
          setCurrentCase(null);
          setGetCasesData(response);
          setTableLoading(false);
          _componentCache.cache.put(cacheId, {
            cases: response,
            currentCase: null,
            customerInfo: null,
            edit: null,
            editRow: null,
            caseEditValues: null
          });
        }
      }
      if (isFailure) {
        if (caseOnly) {
          setCaseLoading(false);
          setCaseError('Error loading the case data. Please try again later');
        } else {
          setGetCasesData([]);
          _componentCache.cache.put(cacheId, {
            cases: []
          });
          setEmptyText(eventData?.event?.data?.message || 'Something went wrong. Please try again later.');
          setTableLoading(false);
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  /**
   *
   * @param {Object} body payload to pass to the cases/search API
   * @param {Boolean} caseOnly If true, it will only updates the currentCase
   * @returns {Array} returned response
   */
  const PostCasesSearch = async (body, caseOnly, refresh) => {
    if (caseOnly) {
      setCaseLoading(true);
    } else {
      if (body?.assignedTeam) setSelectedQueue(body?.assignedTeam);else setSelectedQueue(null);
      setPreviousPayload(caseHistoryMode ? {
        billingAccountNumber: window[window.sessionStorage?.tabId].NEW_BAN
      } : body);
      setTableLoading(true);
    }
    const requestBody = JSON.stringify({
      ...body,
      includeClosed: !caseOnly && !body?.caseId && !body?.billingAccountNumber ? false : true
    });
    const submitEvent = 'SUBMIT';
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = searchCasesWorkflow;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleSearchCasesResponse(successStates, errorStates, caseOnly, refresh));
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
  };
  const handlePostCustomerInfo = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        const response = eventData.event.data.data;
        setCustomerInfoLoading(false);
        setCustomerInfo(response?.account);
        _componentCache.cache.put(cacheId, {
          ...prevValue,
          customerInfo: response?.account
        });
      }
      if (isFailure) {
        setCustomerInfoError(eventData?.event?.data?.message || 'Error loading the customer info. Please try again later!');
        setCustomerInfoLoading(false);
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  /**
   *
   * @param {String} ban
   * @returns {Object} returned response
   */
  const PostCustomerInfo = ban => {
    if (ban?.includes('C') || ban === undefined || ban && isNaN(ban)) return;
    setCustomerInfo(null);
    setCustomerInfoLoading(true);
    setCustomerInfoError('');
    const submitEvent = 'SUBMIT';
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = customerInfoByQueryWorkflow;
    const requestBody = `{
            account(banorctnorsubid: "${ban}") {
                billingAccountNumber
                accountDetails {
                    banStatus
                    accountType
                    accountSubType
                    statusDate
                    customerSince
                    billCycleDate
                    autoPayStatus
                    emailAddress
                    preferredLanguage
                    arBalance
                    openCases
                }
                bridgePayDetails {
                                sequenceNumber
                    bridgePayList {
                        startDate
                        endDate
                        status
                        activityDate
                        amount
                        cancellable
                    }
                }
                billingAddress {
                    fullAddress
                    addressLine1
                    addressLine2
                    city
                    state
                    zip
                    zip4
                }
                name {
                    firstName
                    lastName
                }
            }
        }`;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handlePostCustomerInfo(successStates, errorStates));
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
  };
  const editTableRow = editRowObject => {
    _componentCache.cache.put(cacheId, {
      ...prevValue,
      editRow: editRowObject,
      edit: true
    });
    setEditRow(editRowObject);
    setEdit(true);
  };
  const onRowSelected = selectedRowData => {
    setEditRow(selectedRowData);
    setEdit(false);
    _componentCache.cache.put(cacheId, {
      ...prevValue,
      editRow: selectedRowData,
      edit: false
    });
  };
  const handleUpdateCaseResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        _componentCache.cache.put(cacheId, {
          ...prevValue,
          currentCase: null,
          customerInfo: null,
          edit: null,
          editRow: null,
          caseEditValues: null
        });
        showSuccessNotification();
        setEdit(null);
        setEditRow(null);
        setAssignRow(null);
        setSelectedRowKeys([]);
        setCaseUpdateLoading(false);
        setCustomerInfo(null);
        setCurrentCase(null);
        PostCasesSearch(previousPayload);
      }
      if (isFailure) {
        setError(eventData.event.data.message);
        showErrorNotification(eventData.event.data.message);
        setCaseUpdateLoading(false);
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  // Updates the case on Assign and Edit and Dispatch actions
  const handleCaseUpdate = values => {
    setError(null);
    setCaseUpdateLoading(true);
    const requestBody = JSON.stringify(values);
    const submitEvent = 'SUBMIT';
    const {
      workflow,
      datasource,
      successStates,
      errorStates,
      responseMapping
    } = updateCaseWorkflow;
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: workflow,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.subscribe(workflow, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleUpdateCaseResponse(successStates, errorStates));
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
  };
  const showSuccessNotification = message => {
    _antd.notification['success']({
      message: 'Success',
      description: message ? message : 'Updated case successfully!'
    });
  };
  const showErrorNotification = message => {
    _antd.notification['error']({
      message: 'Error',
      description: message || 'Error updatating case!'
    });
  };
  const handleCloseEdit = () => {
    _componentCache.cache.put(cacheId, {
      ...prevValue,
      edit: null,
      editRow: null,
      caseEditValues: null
    });
    setEdit(null);
    setEditRow(null);
    setSelectedRowKeys([]);
  };
  const handleChangeEdit = value => {
    setEdit(value);
    _componentCache.cache.put(cacheId, {
      ...prevValue,
      edit: value
    });
    setError(null);
  };
  const handleCancelEdit = () => {
    _componentCache.cache.put(cacheId, {
      ...prevValue,
      edit: null,
      caseEditValues: null
    });
    setEdit(false);
    setError(null);
  };
  const handleChangeTab = key => {
    setTabKey(key);
  };
  const handleEditValuesChange = values => {
    _componentCache.cache.put(cacheId, {
      ...prevValue,
      caseEditValues: values
    });
  };
  const handlePostSearch = (body, caseOnly) => {
    if (body?.assignedTo || body?.assignedTeam || body?.caseId) {
      PostCasesSearch(body, caseOnly);
    } else {
      setGetCasesData([]);
      setEmptyText('No cases available');
    }
  };
  const handleClaim = row => {
    const claimBody = {
      status: row?.caseHistory[0]?.status,
      state: row?.caseHistory[0]?.state,
      summary: row?.caseHistory[0]?.summary || `Case claimed by ${attId}`,
      caseId: row?.caseId,
      assignedTo: attId,
      updatedBy: attId
    };
    let isAlreadyAssigned = row?.caseHistory[0]?.assignedTo;
    isAlreadyAssigned ? showModal('Case is already claimed by another user, do you want to proceed?', claimBody) : handleCaseUpdate(claimBody);
  };
  function showModal(msg, claimBody) {
    _antd.Modal.confirm({
      title: 'Confirm',
      content: msg,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        handleCaseUpdate(claimBody);
      }
    });
  }
  const handleAssign = (row, type, bulk) => {
    setAssignType(type);
    if (bulk) {
      setIsBulk(true);
      setAssignRow(row[0]);
    } else {
      setIsBulk(false);
      setAssignRow(row);
      handleRecentActivity(row?.caseId, row?.billingAccountNumber);
    }
  };
  const handleRecentActivity = (id, ban) => {
    const activities = localStorage.getItem('recentActivity') ? JSON.parse(localStorage.getItem('recentActivity')) : [];
    if (activities?.length === recentActivitiesLength) {
      activities.pop();
    }
    if (activities?.includes(id)) {
      let values = [];
      activities.map(caseId => {
        if (caseId === id) {
          values.unshift(id);
        } else {
          values.push(caseId);
        }
      });
      localStorage.setItem('recentActivity', JSON.stringify(values));
    } else {
      localStorage.setItem('recentActivity', JSON.stringify([id, ...activities]));
    }
  };

  // Filtering privilages of the account type from the metdata
  const privilegesOptions = metadata?.find(_ref2 => {
    let {
      domain
    } = _ref2;
    return domain === 'casePrivileges';
  })?.metadata?.categories?.find(_ref3 => {
    let {
      name
    } = _ref3;
    return name === profile;
  });
  const privileges = (0, _arrayToValues.default)(privilegesOptions);
  return privileges?.View || caseHistoryMode ? sessionStorage.getItem('ebbTable') === 'true' ? /*#__PURE__*/_react.default.createElement(_Table.default, null) : /*#__PURE__*/_react.default.createElement("div", {
    key: cacheId,
    className: "cm-content-wrapper d-flex flex-column"
  }, /*#__PURE__*/_react.default.createElement(_reactSplitPane.default, {
    split: "horizontal",
    className: "cm-split-pane"
  }, showTable && /*#__PURE__*/_react.default.createElement(_cmTable.default, {
    key: cacheId,
    data: getCasesData,
    caseManagementCSVHeaders: properties?.caseManagementCSVHeaders || props?.caseManagementCSVHeaders,
    ebbCSVHeaders: properties?.ebbCSVHeaders || props?.ebbCSVHeaders,
    loading: tableLoading,
    onEdit: editTableRow,
    onChecked: onRowSelected,
    onAssign: (row, isBulk) => handleAssign(row, 'Assign', isBulk),
    onDispatch: (row, isBulk) => handleAssign(row, 'Dispatch', isBulk),
    onClaimBulk: (row, isBulk) => handleAssign(row, 'Claim', isBulk),
    postCasesSearch: (body, caseOnly, refresh) => PostCasesSearch(body, caseOnly, refresh),
    onLink: row => setLinkRow(row),
    onCloseEdit: () => handleCloseEdit(),
    selectedRowKeys: selectedRowKeys,
    setSelectedRowKeys: keys => setSelectedRowKeys(keys),
    showSearchFilter: true,
    scroll: null,
    emptyText: emptyText,
    attId: attId,
    privileges: privileges,
    editDisabledStates: editDisabledStates,
    reOpenStateDuration: reOpenStateDuration,
    cmMode: caseHistoryMode,
    onClaim: row => handleClaim(row),
    selectedQueue: selectedQueue,
    previousPayload: previousPayload,
    selectedRows: selectedRows,
    setSelectedRows: setSelectedRows
  }), editRow && /*#__PURE__*/_react.default.createElement(_cmEdit.default, {
    selectedData: editRow,
    error: error,
    data: currentCase,
    prevValue: prevValue,
    caseLoading: editRow?.caseId === prevValue?.currentCase?.caseId ? false : !currentCase && !caseError ? true : caseLoading,
    caseError: caseError,
    setCurrentCase: () => {
      setCustomerInfo(null);
      setCurrentCase(null);
    },
    setRecentActivity: (id, ban) => handleRecentActivity(id, ban),
    postCasesSearch: (body, ban) => {
      PostCasesSearch(body, true);
      !caseHistoryMode && PostCustomerInfo(ban);
    },
    edit: isEdit,
    tabKey: tabKey,
    setEdit: value => handleChangeEdit(value),
    setError: setError,
    onAssign: (type, row) => handleAssign(row, type),
    onUpdate: value => handleCaseUpdate(value),
    onLink: () => setLinkRow(editRow),
    showTable: showTable,
    onToggle: () => setShowTable(!showTable),
    onCloseEdit: () => handleCloseEdit(),
    onCancelEdit: () => handleCancelEdit(),
    onTabChange: value => handleChangeTab(value),
    privileges: privileges,
    metadata: metadata,
    editDisabledStates: editDisabledStates,
    reOpenStateDuration: reOpenStateDuration,
    attId: attId,
    onEditValuesChange: value => handleEditValuesChange(value),
    customerInfo: customerInfo,
    customerInfoLoading: customerInfoLoading,
    customerInfoError: customerInfoError,
    cmMode: caseHistoryMode,
    accountStatuses: properties?.accountStatuses,
    caseCategoriesConfig: caseCategoriesConfig,
    bridgePayStatuses: properties?.bridgePayStatuses,
    caseUpdateLoading: caseUpdateLoading,
    onClaim: row => handleClaim(row),
    profile: profile,
    selectedRows: selectedRows
  })), linkRow && /*#__PURE__*/_react.default.createElement(_cmLinkDialog.default, {
    visible: true,
    onCancel: () => setLinkRow(null),
    suggestions: getCasesData
  }), assignRow && /*#__PURE__*/_react.default.createElement(_cmAssignDialog.default, {
    visible: true,
    type: assignType,
    error: error,
    onAssign: value => handleCaseUpdate(value),
    onCancel: () => {
      setError(null);
      setAssignRow(null);
    },
    data: assignRow,
    currentCase: currentCase,
    metadata: metadata,
    attId: attId,
    privilegesOptions: privilegesOptions,
    selectedRows: selectedRows,
    selectedRowKeys: selectedRowKeys,
    assignDispatchWorkflow: assignDispatchWorkflow,
    searchUsersWorkflow: searchUsersWorkflow,
    errorOnBulkHit: properties?.errorOnBulkHit,
    setSelectedRowKeys: setSelectedRowKeys,
    setEdit: setEdit,
    setEditRow: setEditRow,
    setAssignRow: setAssignRow,
    setCaseUpdateLoading: setCaseUpdateLoading,
    datasources: datasources,
    isBulk: isBulk
  })) : /*#__PURE__*/_react.default.createElement("div", {
    style: {
      textAlign: 'center',
      margin: 24
    }
  }, "No Privileges to view the cases");
}
module.exports = exports.default;