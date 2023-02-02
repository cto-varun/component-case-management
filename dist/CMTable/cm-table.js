"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CMTable;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _antd = require("antd");
var _antTableExtensions = require("ant-table-extensions");
var _icons = require("@ant-design/icons");
var _moment = _interopRequireDefault(require("moment"));
var _reactHighlightWords = _interopRequireDefault(require("react-highlight-words"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  RangePicker
} = _antd.DatePicker;
const {
  Option
} = _antd.Select;
const Priorities = {
  Low: {
    color: '#52c41a',
    title: 'LOW'
  },
  Medium: {
    color: '#1890ff',
    title: 'MEDIUM'
  },
  High: {
    color: '#FF7F50',
    title: 'HIGH'
  },
  high: {
    color: '#FF7F50',
    title: 'HIGH'
  },
  Urgent: {
    color: '#f5222d',
    title: 'URGENT'
  }
};
function CMTable(_ref) {
  let {
    data,
    loading,
    onEdit,
    onChecked,
    onAssign,
    onDispatch,
    onClaim,
    onCloseEdit,
    onLink,
    showSearchFilter,
    attId,
    emptyText,
    privileges,
    editDisabledStates,
    reOpenStateDuration,
    selectedRowKeys,
    setSelectedRowKeys,
    postCasesSearch,
    cmMode,
    caseManagementCSVHeaders,
    selectedQueue,
    previousPayload,
    selectedRows,
    setSelectedRows,
    onClaimBulk,
    ebbCSVHeaders
  } = _ref;
  const exportButton = (0, _react.useRef)(null);
  const [owner, setOwner] = (0, _react.useState)(null);
  const [dates, setDates] = (0, _react.useState)(null);
  const [searchText, setSearchText] = (0, _react.useState)('');
  const [showInputFileName, setShowInputFileName] = (0, _react.useState)(false);
  const [fileName, setFileName] = (0, _react.useState)('');
  const [filteredInfo, setFilteredInfo] = (0, _react.useState)({});
  const [sortedInfo, setSortedInfo] = (0, _react.useState)({});

  // search states
  const [searchFilters, setSearchFilters] = (0, _react.useState)({
    searchText: '',
    searchedColumn: ''
  });

  // Map owners list from data
  let ownerOptionsList = [];
  const ownerOptions = data?.filter(_ref2 => {
    let {
      caseHistory
    } = _ref2;
    if (caseHistory?.length > 0 && caseHistory[0]?.assignedTo && !ownerOptionsList.includes(caseHistory[0]?.assignedTo)) {
      ownerOptionsList.push(caseHistory[0]?.assignedTo);
      return true;
    } else {
      return false;
    }
  })?.map(_ref3 => {
    let {
      caseHistory
    } = _ref3;
    return {
      value: caseHistory[0]?.assignedTo,
      name: caseHistory[0]?.assignedTo
    };
  });

  // const groupByOptions = [
  //     { value: 'billingAccountNumber', name: 'BAN' },
  //     { value: 'ctn', name: 'CTN' },
  //     { value: 'status', name: 'Status' },
  //     { value: 'category', name: 'Category' },
  // ];
  const columnOptions = [{
    value: 'billingAccountNumber',
    name: 'BAN'
  }, {
    value: 'phoneNumber',
    name: 'CTN'
  }, {
    value: 'createdAt',
    name: 'Created'
  }, {
    value: 'assignedTo',
    name: 'Assigned To'
  }, {
    value: 'condition',
    name: 'Case Condition'
  }, {
    value: 'category',
    name: 'Category'
  }, {
    value: 'subCategory1',
    name: 'SubCategory1'
  }, {
    value: 'subCategory2',
    name: 'SubCategory2'
  }, {
    value: 'status',
    name: 'Status'
  }, {
    value: 'closedAt',
    name: 'Last Updated'
  }, {
    value: 'priority',
    name: 'Priority'
  }, {
    value: 'problemDateTime',
    name: 'Problem Date/Time'
  }, {
    value: 'firstName',
    name: 'First Name'
  }, {
    value: 'lastName',
    name: 'Last Name'
  }, {
    value: 'imei',
    name: 'IMEI'
  }, {
    value: 'city',
    name: 'City'
  }, {
    value: 'state',
    name: 'State'
  }, {
    value: 'deviceType',
    name: 'Device Type'
  }, {
    value: 'cricketDevice',
    name: 'Cricket Device'
  }];
  const formatDateToUs = value => value ? new Date(value).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h12'
  }) : '';
  const getColumnSearchProps = function (dataIndex, dataName) {
    let isDatePicker = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return {
      filterDropdown: _ref4 => {
        let {
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters
        } = _ref4;
        return /*#__PURE__*/_react.default.createElement("div", {
          style: {
            padding: 8
          }
        }, isDatePicker ? /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(RangePicker, {
          value: selectedKeys[0] && selectedKeys[0][0] === '' ? '' : selectedKeys[0] && selectedKeys[0][0] !== '' ? [(0, _moment.default)(selectedKeys[0][0]), (0, _moment.default)(selectedKeys[0][1])] : '',
          allowClear: true,
          onChange: (e, value) => {
            setSelectedKeys(value ? [value] : []);
          },
          onPressEnter: () => handleSearch(selectedKeys, confirm, dataIndex),
          style: {
            width: 200,
            marginBottom: 8
          }
        })) : /*#__PURE__*/_react.default.createElement(_antd.Input, {
          placeholder: `Search ${dataName}`,
          value: selectedKeys[0],
          onChange: e => setSelectedKeys(e.target.value ? [e.target.value] : []),
          onPressEnter: () => handleSearch(selectedKeys, confirm, dataIndex),
          style: {
            width: 188,
            marginBottom: 8,
            display: 'block'
          }
        }), /*#__PURE__*/_react.default.createElement(_antd.Space, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
          type: "primary",
          onClick: () => handleSearch(selectedKeys, confirm, dataIndex),
          icon: /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, null),
          size: "small",
          style: {
            width: 90
          }
        }, "Search"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
          onClick: () => handleReset(clearFilters),
          size: "small",
          style: {
            width: 90
          }
        }, "Reset")));
      },
      filterIcon: filtered => /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, {
        style: {
          color: filtered ? '#1890ff' : undefined
        }
      }),
      onFilter: (value, record) => {
        if (isDatePicker) {
          const startDate = (0, _moment.default)(value[0]);
          const endDate = (0, _moment.default)(value[1]);
          const compareDate = (0, _moment.default)(record[dataIndex]);
          return record[dataIndex] ? compareDate.isBetween(startDate, endDate) : '';
        } else {
          return record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toString().toLowerCase()) : '';
        }
      },
      render: text => {
        return isDatePicker ? formatDateToUs(text) : searchFilters.searchedColumn === dataIndex && !isDatePicker ? /*#__PURE__*/_react.default.createElement(_reactHighlightWords.default, {
          highlightStyle: {
            backgroundColor: '#ffc069',
            padding: 0
          },
          searchWords: [searchFilters.searchText],
          autoEscape: true,
          textToHighlight: text ? text.toString() : ''
        }) : text;
      }
    };
  };
  function handleSearch(selectedKeys, confirm, dataIndex) {
    confirm();
    setSearchFilters({
      ...searchFilters,
      searchText: selectedKeys[0],
      searchedColumn: dataIndex
    });
  }
  function handleReset(clearFilters) {
    clearFilters();
    setSearchFilters({
      ...searchFilters,
      searchText: ''
    });
  }
  const columnsForNetWorkQueue = ['caseId', 'externalCaseId', 'billingAccountNumber', 'phoneNumber', 'imei', 'createdAt', 'assignedTo', 'category', 'subCategory1', 'subCategory2', 'status', 'closedAt', 'priority'];
  const queuesWithDiffrentColumns = ['Network', 'Device-n-Product'];
  (0, _react.useEffect)(() => {
    selectQueue();
  }, [selectedQueue]);
  const selectQueue = () => {
    const queues = queuesWithDiffrentColumns?.includes(selectedQueue) ? columnsForNetWorkQueue : ['caseId', 'externalCaseId', 'billingAccountNumber', 'createdAt', 'assignedTo', 'category', 'subCategory1', 'subCategory2', 'status', 'closedAt', 'priority'];
    setSelectedColumns(queues);
  };
  const [selectedColumns, setSelectedColumns] = (0, _react.useState)([]);
  const handleClear = () => {
    setSortedInfo({});
    setFilteredInfo({});
    setSearchText('');
    setDates(null);
    setOwner(null);
  };
  const caseHistory = data => {
    return data && data.caseHistory && data.caseHistory[0];
  };
  const columnData = data?.map(caseData => {
    let result = {
      ...caseData,
      ...caseHistory(caseData)?.additionalProperties,
      ...caseData?.additionalProperties,
      externalCaseId: caseData.externalCaseId,
      additionalProperties: caseHistory(caseData)?.additionalProperties,
      category: caseHistory(caseData)?.category,
      assignedTo: caseHistory(caseData)?.assignedTo,
      subCategory1: caseHistory(caseData)?.subCategory1,
      subCategory2: caseHistory(caseData)?.subCategory2,
      status: caseHistory(caseData)?.status,
      condition: caseHistory(caseData)?.state,
      priority: caseHistory(caseData)?.priority,
      closedAt: caseData?.closedAt || caseHistory(caseData)?.updatedAt
    };
    return result;
  });

  // Check the date lies between two dates
  const checkDateBetweenDates = date => {
    let startDate = (0, _moment.default)(new Date(dates[0])).subtract(1, 'days').format('YYYY-MM-DD');
    let endDate = (0, _moment.default)(new Date(dates[1])).add(1, 'days').format('YYYY-MM-DD');
    let caseDate = (0, _moment.default)(new Date(date)).format('YYYY-MM-DD');
    let inRange = (0, _moment.default)(caseDate).isBetween(startDate, endDate);
    return inRange;
  };
  const filteredData = columnData?.filter(data => !searchText || data?.caseId?.toLowerCase()?.includes(searchText?.toLowerCase()))?.filter(_ref5 => {
    let {
      caseHistory
    } = _ref5;
    return !owner || caseHistory?.length > 0 && caseHistory[0]?.assignedTo === owner;
  }).filter(item => !dates || checkDateBetweenDates(item.createdAt));
  const getColumns = () => {
    const columns = [{
      width: 32,
      render: (value, row) => {
        // Disable the fields and buttons based on the State and re open duration
        const disableButtons = value?.caseHistory && editDisabledStates.includes(value?.caseHistory[0]?.condition);
        const owner = value?.caseHistory && value?.caseHistory[0]?.assignedTo && value?.caseHistory[0]?.assignedTo === attId;
        return value?.caseId?.includes('C-') ? /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
          menu: /*#__PURE__*/_react.default.createElement(_antd.Menu, null, /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
            onClick: () => onEdit(row),
            disabled: disableButtons
          }, "Edit"), !cmMode && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ' ', /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
            onClick: () => onAssign(row),
            disabled: disableButtons || !privileges.Edit
          }, "Assign"), /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
            onClick: () => onDispatch(row),
            disabled: disableButtons || !privileges.Dispatch
          }, "Dispatch"), /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
            onClick: () => onClaim(row),
            disabled: owner || disableButtons || !privileges.Edit
          }, "Claim")))
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "row-actions-btn"
        }, /*#__PURE__*/_react.default.createElement(_icons.MoreOutlined, {
          className: "row-actions-btn-icon"
        }))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
      }
    }];

    /**
     *
     * @param {Object} a first object
     * @param {Object} b second object
     * @param {String} property Property to  the table
     * @returns {Array} returns the sorted one
     */
    const sortByProperty = (a, b, property) => a[property] !== b[property] ? a[property] < b[property] ? -1 : 1 : 0;
    const filters = generateFilters();
    const columnArr = [{
      title: 'CASE ID',
      dataIndex: 'caseId',
      sorter: (a, b) => a.caseId.length - b.caseId.length,
      sortOrder: sortedInfo.field === 'caseId' && sortedInfo.order,
      filteredValue: filteredInfo.caseId || null,
      filters: filters?.caseId || [],
      onFilter: (value, record) => record?.caseId?.indexOf(value) === 0,
      ...getColumnSearchProps('caseId', 'CASE ID')
    }, {
      title: 'EXTERNAL ID',
      dataIndex: 'externalCaseId',
      sorter: (a, b) => a.externalCaseId?.length - b.externalCaseId?.length,
      sortOrder: sortedInfo?.field === 'externalCaseId' && sortedInfo?.order,
      filteredValue: filteredInfo?.externalCaseId || null,
      filters: filters?.externalCaseId || [],
      onFilter: (value, record) => record?.externalCaseId?.indexOf(value) === 0,
      ...getColumnSearchProps('externalCaseId', 'EXTERNAL ID')
    }, {
      title: 'BAN',
      dataIndex: 'billingAccountNumber',
      sortOrder: sortedInfo.field === 'billingAccountNumber' && sortedInfo.order,
      filteredValue: filteredInfo.billingAccountNumber || null,
      sorter: (a, b) => a.billingAccountNumber - b.billingAccountNumber,
      filters: filters?.billingAccountNumber || [],
      onFilter: (value, record) => {
        return record?.billingAccountNumber === value;
      },
      ...getColumnSearchProps('billingAccountNumber', 'BAN')
    }, {
      title: 'CTN',
      dataIndex: 'phoneNumber',
      sortOrder: sortedInfo.field === 'phoneNumber' && sortedInfo.order,
      filteredValue: filteredInfo.phoneNumber || null,
      sorter: (a, b) => a.phoneNumber - b.phoneNumber,
      filters: filters?.phoneNumber || [],
      onFilter: (value, record) => {
        return record?.phoneNumber === value;
      },
      ...getColumnSearchProps('phoneNumber', 'Phone Number')
    }, {
      title: 'IMEI',
      dataIndex: 'imei',
      sortOrder: sortedInfo.field === 'imei' && sortedInfo.order,
      filteredValue: filteredInfo.imei || null,
      sorter: (a, b) => a.imei - b.imei,
      filters: filters?.imei || [],
      onFilter: (value, record) => {
        return record?.imei === value;
      },
      ...getColumnSearchProps('imei', 'IMEI')
    }, {
      title: 'CREATED',
      dataIndex: 'createdAt',
      sortOrder: sortedInfo.field === 'createdAt' && sortedInfo.order,
      filteredValue: filteredInfo.createdAt || null,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      filters: filters?.createdAt || [],
      onFilter: (value, record) => record?.createdAt?.indexOf(value) === 0,
      ...getColumnSearchProps('createdAt', 'CREATED', true)
    }, {
      title: 'ASSIGNED TO',
      dataIndex: 'assignedTo',
      sortOrder: sortedInfo.field === 'assignedTo' && sortedInfo.order,
      filteredValue: filteredInfo.assignedTo || null,
      sorter: (a, b) => sortByProperty(a, b, 'assignedTo'),
      filters: filters?.assignedTo || [],
      onFilter: (value, record) => record?.assignedTo?.indexOf(value) === 0,
      ...getColumnSearchProps('assignedTo', 'ASSIGNED TO')
    }, {
      title: 'CATEGORY',
      dataIndex: 'category',
      sortOrder: sortedInfo.field === 'category' && sortedInfo.order,
      filteredValue: filteredInfo.category || null,
      sorter: (a, b) => sortByProperty(a, b, 'category'),
      filters: filters?.category || [],
      onFilter: (value, record) => record?.category?.indexOf(value) === 0
    }, {
      title: 'CASE CONDITION',
      dataIndex: 'condition',
      sortOrder: sortedInfo.field === 'condition' && sortedInfo.order,
      filteredValue: filteredInfo.condition || null,
      sorter: (a, b) => sortByProperty(a, b, 'condition'),
      filters: filters?.condition || [],
      onFilter: (value, record) => record?.condition?.indexOf(value) === 0
    }, {
      title: 'SUBCATEGORY1',
      dataIndex: 'subCategory1',
      sortOrder: sortedInfo.field === 'subCategory1' && sortedInfo.order,
      filteredValue: filteredInfo.subCategory1 || null,
      sorter: (a, b) => sortByProperty(a, b, 'subCategory1'),
      filters: filters?.subCategory1 || [],
      onFilter: (value, record) => record?.subCategory1?.indexOf(value) === 0
    }, {
      title: 'SUBCATEGORY2',
      dataIndex: 'subCategory2',
      sortOrder: sortedInfo.field === 'subCategory2' && sortedInfo.order,
      filteredValue: filteredInfo.subCategory2 || null,
      sorter: (a, b) => sortByProperty(a, b, 'subCategory2'),
      filters: filters?.subCategory2 || [],
      onFilter: (value, record) => record?.subCategory2?.indexOf(value) === 0
    }, {
      title: 'STATUS',
      dataIndex: 'status',
      sortOrder: sortedInfo.field === 'status' && sortedInfo.order,
      filteredValue: filteredInfo.status || null,
      filters: filters?.status || [],
      onFilter: (value, record) => record?.status?.indexOf(value) === 0,
      sorter: (a, b) => sortByProperty(a, b, 'status'),
      render: value => {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: (0, _classnames.default)('row-status', value === 'new' && 'row-status-new')
        }, value);
      }
    }, {
      title: 'LAST UPDATED',
      dataIndex: 'closedAt',
      sortOrder: sortedInfo.field === 'closedAt' && sortedInfo.order,
      filteredValue: filteredInfo.closedAt || null,
      sorter: (a, b) => new Date(a.closedAt) - new Date(b.closedAt),
      filters: filters?.closedAt || [],
      onFilter: (value, record) => record?.closedAt?.indexOf(value) === 0,
      ...getColumnSearchProps('closedAt', 'LAST UPDATED', true)
    }, {
      title: 'PRIORITY',
      dataIndex: 'priority',
      sortOrder: sortedInfo.field === 'priority' && sortedInfo.order,
      filteredValue: filteredInfo.priority || null,
      sorter: (a, b) => sortByProperty(a, b, 'priority'),
      render: value => {
        return value ? /*#__PURE__*/_react.default.createElement(_antd.Tag, {
          style: {
            color: Priorities[value]?.color,
            background: 'white',
            fontWeight: 500,
            border: `1.5px solid ${Priorities[value]?.color}`
          }
        }, Priorities[value]?.title ?? value) : null;
      },
      filters: filters.priority || [],
      onFilter: (value, record) => record?.priority?.indexOf(value) === 0
    }, {
      title: 'First Name',
      dataIndex: 'firstName',
      sortOrder: sortedInfo.field === 'firstName' && sortedInfo.order,
      filteredValue: filteredInfo.firstName || null,
      sorter: (a, b) => sortByProperty(a, b, 'firstName'),
      filters: filters.firstName || [],
      onFilter: (value, record) => record?.firstName?.indexOf(value) === 0,
      ...getColumnSearchProps('firstName', 'First Name')
    }, {
      title: 'Last Name',
      dataIndex: 'lastName',
      sortOrder: sortedInfo.field === 'lastName' && sortedInfo.order,
      filteredValue: filteredInfo.lastName || null,
      sorter: (a, b) => sortByProperty(a, b, 'lastName'),
      filters: filters.lastName || [],
      onFilter: (value, record) => record?.lastName?.indexOf(value) === 0,
      ...getColumnSearchProps('lastName', 'Last Name')
    }, {
      title: 'PROBLEM DATE/TIME',
      dataIndex: 'problemDateTime',
      sortOrder: sortedInfo.field === 'problemDateTime' && sortedInfo.order,
      filteredValue: filteredInfo.problemDateTime || null,
      sorter: (a, b) => new Date(a.problemDateTime) - new Date(b.problemDateTime),
      onFilter: (value, record) => record?.problemDateTime?.indexOf(value) === 0,
      ...getColumnSearchProps('problemDateTime', 'PROBLEM DATE/TIME', true)
    }, {
      title: 'DEVICE TYPE',
      dataIndex: 'deviceType',
      sortOrder: sortedInfo.field === 'deviceType' && sortedInfo.order,
      filteredValue: filteredInfo.deviceType || null,
      sorter: (a, b) => sortByProperty(a, b, 'deviceType'),
      filters: filters.deviceType || [],
      onFilter: (value, record) => record?.deviceType?.indexOf(value) === 0
    }, {
      title: 'CITY',
      dataIndex: 'city',
      sortOrder: sortedInfo.field === 'city' && sortedInfo.order,
      filteredValue: filteredInfo.city || null,
      sorter: (a, b) => sortByProperty(a, b, 'city'),
      filters: filters.city || [],
      onFilter: (value, record) => record?.city?.indexOf(value) === 0
    }, {
      title: 'STATE',
      dataIndex: 'state',
      sortOrder: sortedInfo.field === 'state' && sortedInfo.order,
      filteredValue: filteredInfo.state || null,
      filters: filters.state || [],
      sorter: (a, b) => sortByProperty(a, b, 'state'),
      onFilter: (value, record) => record?.state?.indexOf(value) === 0
    }, {
      title: 'CRICKET DEVICE',
      dataIndex: 'cricketDevice',
      sortOrder: sortedInfo.field === 'cricketDevice' && sortedInfo.order,
      filteredValue: filteredInfo.cricketDevice || null,
      filters: filters.cricketDevice || [],
      sorter: (a, b) => sortByProperty(a, b, 'cricketDevice'),
      onFilter: (value, record) => record?.cricketDevice?.indexOf(value) === 0
    }];
    columnArr.forEach(item => {
      if (selectedColumns.indexOf(item.dataIndex) !== -1) {
        columns.push(item);
      }
    });
    columns.push({
      width: 32,
      title: /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
        align: "right",
        menu: /*#__PURE__*/_react.default.createElement(_antd.Menu, null, columnOptions.map(col => /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
          key: col.value
        }, /*#__PURE__*/_react.default.createElement(_antd.Checkbox, {
          checked: selectedColumns.indexOf(col.value) !== -1,
          onClick: () => {
            const index = selectedColumns.indexOf(col.value);
            if (index === -1) {
              selectedColumns.push(col.value);
            } else {
              selectedColumns.splice(index, 1);
            }
            setSelectedColumns([...selectedColumns]);
          }
        }, col.name))))
      }, /*#__PURE__*/_react.default.createElement(_icons.MoreOutlined, {
        style: {
          fontSize: 20
        }
      })),
      dataIndex: ''
    });
    return columns;
  };
  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setFilteredInfo(filters);
  };
  function generateFilters() {
    let filters = {};
    for (const element of filteredData) {
      Object.keys(element).forEach((key, index) => {
        if (!filters[key]) filters[key] = [];
        let indexValue = filters[key]?.findIndex(ele => ele.value === element[key]);
        if (indexValue === -1) {
          filters[key]?.push({
            value: element[key],
            text: key === 'closedAt' ? formatDateToUs(element[key]) : element[key]
          });
        }
      });
    }
    return filters;
  }
  const onSelectChange = (selectedRow, selectedRecords) => {
    const selectedRowData = data.find(dt => dt.caseId === selectedRow[0]);
    setSelectedRowKeys(selectedRow);
    setSelectedRows(selectedRecords);
    onChecked(selectedRowData);
  };
  const rowSelection = {
    selectedRowKeys,
    columnWidth: 32,
    onChange: onSelectChange
  };
  return /*#__PURE__*/_react.default.createElement(_antd.Space, {
    className: "cm-table-wrapper",
    size: 30,
    direction: "vertical"
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 24,
    className: "total-counting-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Space, {
    size: 8
  }, /*#__PURE__*/_react.default.createElement(_icons.ProfileOutlined, null), /*#__PURE__*/_react.default.createElement("span", {
    className: "cm-pending-ebb-text"
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "cm-pending-ebb-bold"
  }, previousPayload?.assignedTeam ? previousPayload?.assignedTeam + ' - ' : '', `Total `, filteredData ? filteredData?.length : 0), ` cases`))), /*#__PURE__*/_react.default.createElement(_antd.Space, {
    className: "cm-table-filters",
    size: 8
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "input-boxes-container"
  }, selectedRowKeys?.length > 0 && !cmMode ? /*#__PURE__*/_react.default.createElement("div", {
    className: "filter-row"
  }, /*#__PURE__*/_react.default.createElement(_antd.Dropdown, {
    menu: /*#__PURE__*/_react.default.createElement(_antd.Menu, null, /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      onClick: () => {
        onAssign(selectedRows, true);
      },
      disabled: !privileges.Dispatch
    }, "Assign"), /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      onClick: () => {
        onDispatch(selectedRows, true);
      },
      disabled: !privileges.Dispatch
    }, "Dispatch"), /*#__PURE__*/_react.default.createElement(_antd.Menu.Item, {
      onClick: () => {
        onClaimBulk(selectedRows, true);
      },
      disabled: !privileges.Dispatch
    }, "Claim"))
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "row-actions-btn"
  }, /*#__PURE__*/_react.default.createElement(_icons.MoreOutlined, {
    className: "row-actions-btn-icon"
  })))) : null, /*#__PURE__*/_react.default.createElement("div", null, showSearchFilter && /*#__PURE__*/_react.default.createElement(_antd.Input, {
    className: "search-box",
    value: searchText,
    placeholder: "Enter case ID to search",
    onChange: e => setSearchText(e.target.value),
    suffix: /*#__PURE__*/_react.default.createElement(_icons.SearchOutlined, {
      style: {
        color: searchText ? '#1890ff' : 'rgba(0, 0, 0, 0.45)'
      }
    })
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "refresh-icon-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "topRight",
    title: "Refresh Cases"
  }, /*#__PURE__*/_react.default.createElement(_icons.SyncOutlined, {
    className: "refresh-icon",
    onClick: () => postCasesSearch(!cmMode ? previousPayload : {
      billingAccountNumber: window[sessionStorage.tabId].NEW_BAN
    }, false, true)
  })))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    placeholder: "Input File Name",
    required: true,
    className: `cm-file-input ${showInputFileName ? '' : 'd-none'}`,
    onChange: e => {
      setFileName(e.target.value);
    },
    value: fileName
  }), /*#__PURE__*/_react.default.createElement(_antTableExtensions.ExportTableButton, {
    dataSource: filteredData,
    columns: caseManagementCSVHeaders,
    fileName: fileName,
    btnProps: {
      type: 'primary',
      icon: /*#__PURE__*/_react.default.createElement(_icons.FileExcelOutlined, null),
      className: 'd-none',
      ref: exportButton
    },
    showColumnPicker: true
  }, "GO"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    className: showInputFileName ? '' : 'd-none',
    icon: /*#__PURE__*/_react.default.createElement(_icons.FileExcelOutlined, null),
    onClick: () => {
      exportButton.current.click();
      setShowInputFileName(false);
    }
  }, "Go"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    className: showInputFileName ? 'd-none' : '',
    icon: /*#__PURE__*/_react.default.createElement(_icons.FileExcelOutlined, null),
    onClick: () => {
      setFileName('');
      setShowInputFileName(true);
    }
  }, "Export to CSV"), /*#__PURE__*/_react.default.createElement(RangePicker, {
    className: "filter-item",
    value: dates,
    style: {
      minwidth: 180
    },
    onChange: value => setDates(value)
  }), /*#__PURE__*/_react.default.createElement(_antd.Select, {
    className: "filter-item",
    style: {
      width: 180
    },
    placeholder: "Select Assigned To",
    value: owner,
    onChange: value => setOwner(value)
  }, ownerOptions.map(owner => /*#__PURE__*/_react.default.createElement(Option, {
    value: owner.value,
    key: owner.value
  }, owner.name))), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "filter-item",
    onClick: () => handleClear()
  }, "Clear Filters"), selectedRowKeys?.length > 0 && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "bulk-dispatch-button",
    onClick: () => {
      onDispatch(selectedRows, true);
    }
  }, /*#__PURE__*/_react.default.createElement(_icons.ArrowUpOutlined, {
    className: "bulk-dispatch-icon"
  }), " Dispatch"))), /*#__PURE__*/_react.default.createElement(_antTableExtensions.Table, {
    loading: loading,
    className: "cm-table",
    rowClassName: (record, index) => record?.assignedTo === '' || record?.assignedTo === undefined ? '' : 'blue-row',
    columns: getColumns(),
    dataSource: filteredData,
    pagination: {
      position: 'bottom'
    },
    onChange: handleChange,
    rowSelection: rowSelection,
    size: "middle",
    rowKey: "caseId",
    locale: {
      emptyText: emptyText
    }
  }));
}
module.exports = exports.default;