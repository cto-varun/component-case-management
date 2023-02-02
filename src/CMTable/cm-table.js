import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';

import {
    Checkbox,
    Dropdown,
    Menu,
    Select,
    Space,
    Tag,
    DatePicker,
    Button,
    Input,
    Tooltip,
    Col,
} from 'antd';
import { Table, ExportTableButton } from 'ant-table-extensions';
import {
    MoreOutlined,
    SearchOutlined,
    SyncOutlined,
    FileExcelOutlined,
    ProfileOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';
import moment from 'moment';
import Highlighter from 'react-highlight-words';

import './styles.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Priorities = {
    Low: {
        color: '#52c41a',
        title: 'LOW',
    },
    Medium: {
        color: '#1890ff',
        title: 'MEDIUM',
    },
    High: {
        color: '#FF7F50',
        title: 'HIGH',
    },
    high: {
        color: '#FF7F50',
        title: 'HIGH',
    },
    Urgent: {
        color: '#f5222d',
        title: 'URGENT',
    },
};

export default function CMTable({
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
    ebbCSVHeaders,
}) {
    const exportButton = useRef(null);
    const [owner, setOwner] = useState(null);
    const [dates, setDates] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showInputFileName, setShowInputFileName] = useState(false);
    const [fileName, setFileName] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});

    // search states
    const [searchFilters, setSearchFilters] = useState({
        searchText: '',
        searchedColumn: '',
    });

    // Map owners list from data
    let ownerOptionsList = [];
    const ownerOptions = data
        ?.filter(({ caseHistory }) => {
            if (
                caseHistory?.length > 0 &&
                caseHistory[0]?.assignedTo &&
                !ownerOptionsList.includes(caseHistory[0]?.assignedTo)
            ) {
                ownerOptionsList.push(caseHistory[0]?.assignedTo);
                return true;
            } else {
                return false;
            }
        })
        ?.map(({ caseHistory }) => {
            return {
                value: caseHistory[0]?.assignedTo,
                name: caseHistory[0]?.assignedTo,
            };
        });

    // const groupByOptions = [
    //     { value: 'billingAccountNumber', name: 'BAN' },
    //     { value: 'ctn', name: 'CTN' },
    //     { value: 'status', name: 'Status' },
    //     { value: 'category', name: 'Category' },
    // ];
    const columnOptions = [
        { value: 'billingAccountNumber', name: 'BAN' },
        { value: 'phoneNumber', name: 'CTN' },
        { value: 'createdAt', name: 'Created' },
        { value: 'assignedTo', name: 'Assigned To' },
        { value: 'condition', name: 'Case Condition' },
        { value: 'category', name: 'Category' },
        { value: 'subCategory1', name: 'SubCategory1' },
        { value: 'subCategory2', name: 'SubCategory2' },
        { value: 'status', name: 'Status' },
        { value: 'closedAt', name: 'Last Updated' },
        { value: 'priority', name: 'Priority' },
        { value: 'problemDateTime', name: 'Problem Date/Time' },
        { value: 'firstName', name: 'First Name' },
        { value: 'lastName', name: 'Last Name' },
        { value: 'imei', name: 'IMEI' },
        { value: 'city', name: 'City' },
        { value: 'state', name: 'State' },
        { value: 'deviceType', name: 'Device Type' },
        { value: 'cricketDevice', name: 'Cricket Device' },
    ];

    const formatDateToUs = (value) =>
        value
            ? new Date(value).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hourCycle: 'h12',
              })
            : '';

    const getColumnSearchProps = (
        dataIndex,
        dataName,
        isDatePicker = false
    ) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }}>
                {isDatePicker ? (
                    <div>
                        <RangePicker
                            value={
                                selectedKeys[0] && selectedKeys[0][0] === ''
                                    ? ''
                                    : selectedKeys[0] &&
                                      selectedKeys[0][0] !== ''
                                    ? [
                                          moment(selectedKeys[0][0]),
                                          moment(selectedKeys[0][1]),
                                      ]
                                    : ''
                            }
                            allowClear={true}
                            onChange={(e, value) => {
                                setSelectedKeys(value ? [value] : []);
                            }}
                            onPressEnter={() =>
                                handleSearch(selectedKeys, confirm, dataIndex)
                            }
                            style={{ width: 200, marginBottom: 8 }}
                        />
                    </div>
                ) : (
                    <Input
                        placeholder={`Search ${dataName}`}
                        value={selectedKeys[0]}
                        onChange={(e) =>
                            setSelectedKeys(
                                e.target.value ? [e.target.value] : []
                            )
                        }
                        onPressEnter={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        style={{
                            width: 188,
                            marginBottom: 8,
                            display: 'block',
                        }}
                    />
                )}
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{ color: filtered ? '#1890ff' : undefined }}
            />
        ),
        onFilter: (value, record) => {
            if (isDatePicker) {
                const startDate = moment(value[0]);
                const endDate = moment(value[1]);
                const compareDate = moment(record[dataIndex]);
                return record[dataIndex]
                    ? compareDate.isBetween(startDate, endDate)
                    : '';
            } else {
                return record[dataIndex]
                    ? record[dataIndex]
                          .toString()
                          .toLowerCase()
                          .includes(value.toString().toLowerCase())
                    : '';
            }
        },
        render: (text) => {
            return isDatePicker ? (
                formatDateToUs(text)
            ) : searchFilters.searchedColumn === dataIndex && !isDatePicker ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchFilters.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            );
        },
    });

    function handleSearch(selectedKeys, confirm, dataIndex) {
        confirm();
        setSearchFilters({
            ...searchFilters,
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    }

    function handleReset(clearFilters) {
        clearFilters();
        setSearchFilters({
            ...searchFilters,
            searchText: '',
        });
    }

    const columnsForNetWorkQueue = [
        'caseId',
        'externalCaseId',
        'billingAccountNumber',
        'phoneNumber',
        'imei',
        'createdAt',
        'assignedTo',
        'category',
        'subCategory1',
        'subCategory2',
        'status',
        'closedAt',
        'priority',
    ];

    const queuesWithDiffrentColumns = ['Network', 'Device-n-Product'];
    useEffect(() => {
        selectQueue();
    }, [selectedQueue]);

    const selectQueue = () => {
        const queues = queuesWithDiffrentColumns?.includes(selectedQueue)
            ? columnsForNetWorkQueue
            : [
                  'caseId',
                  'externalCaseId',
                  'billingAccountNumber',
                  'createdAt',
                  'assignedTo',
                  'category',
                  'subCategory1',
                  'subCategory2',
                  'status',
                  'closedAt',
                  'priority',
              ];
        setSelectedColumns(queues);
    };
    const [selectedColumns, setSelectedColumns] = useState([]);

    const handleClear = () => {
        setSortedInfo({});
        setFilteredInfo({});
        setSearchText('');
        setDates(null);
        setOwner(null);
    };

    const caseHistory = (data) => {
        return data && data.caseHistory && data.caseHistory[0];
    };
    const columnData = data?.map((caseData) => {
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
            closedAt: caseData?.closedAt || caseHistory(caseData)?.updatedAt,
        };
        return result;
    });

    // Check the date lies between two dates
    const checkDateBetweenDates = (date) => {
        let startDate = moment(new Date(dates[0]))
            .subtract(1, 'days')
            .format('YYYY-MM-DD');
        let endDate = moment(new Date(dates[1]))
            .add(1, 'days')
            .format('YYYY-MM-DD');
        let caseDate = moment(new Date(date)).format('YYYY-MM-DD');
        let inRange = moment(caseDate).isBetween(startDate, endDate);
        return inRange;
    };

    const filteredData = columnData
        ?.filter(
            (data) =>
                !searchText ||
                data?.caseId?.toLowerCase()?.includes(searchText?.toLowerCase())
        )
        ?.filter(
            ({ caseHistory }) =>
                !owner ||
                (caseHistory?.length > 0 &&
                    caseHistory[0]?.assignedTo === owner)
        )
        .filter((item) => !dates || checkDateBetweenDates(item.createdAt));

    const getColumns = () => {
        const columns = [
            {
                width: 32,
                render: (value, row) => {
                    // Disable the fields and buttons based on the State and re open duration
                    const disableButtons =
                        value?.caseHistory &&
                        editDisabledStates.includes(
                            value?.caseHistory[0]?.condition
                        );

                    const owner =
                        value?.caseHistory &&
                        value?.caseHistory[0]?.assignedTo &&
                        value?.caseHistory[0]?.assignedTo === attId;

                    return value?.caseId?.includes('C-') ? (
                        <Dropdown
                            menu={
                                <Menu>
                                    <Menu.Item
                                        onClick={() => onEdit(row)}
                                        disabled={disableButtons}
                                    >
                                        Edit
                                    </Menu.Item>
                                    {!cmMode && (
                                        <>
                                            {' '}
                                            <Menu.Item
                                                onClick={() => onAssign(row)}
                                                disabled={
                                                    disableButtons ||
                                                    !privileges.Edit
                                                }
                                            >
                                                Assign
                                            </Menu.Item>
                                            <Menu.Item
                                                onClick={() => onDispatch(row)}
                                                disabled={
                                                    disableButtons ||
                                                    !privileges.Dispatch
                                                }
                                            >
                                                Dispatch
                                            </Menu.Item>
                                            <Menu.Item
                                                onClick={() => onClaim(row)}
                                                disabled={
                                                    owner ||
                                                    disableButtons ||
                                                    !privileges.Edit
                                                }
                                            >
                                                Claim
                                            </Menu.Item>
                                        </>
                                    )}
                                    {/* <Menu.Item
                                        onClick={() => onLink(row)}
                                        disabled
                                    >
                                        Link Case
                                    </Menu.Item>
                                    <Menu.Item disabled>
                                        Mark Complete
                                    </Menu.Item>
                                    <Menu.Item
                                        disabled
                                        // Change to below condition when Forward is implemented
                                        // disabled={disableButtons || !privileges.Forward}
                                    >
                                        Forward
                                    </Menu.Item>
                                    <Menu.Item disabled>ETR</Menu.Item> */}
                                </Menu>
                            }
                        >
                            <div className="row-actions-btn">
                                <MoreOutlined className="row-actions-btn-icon" />
                            </div>
                        </Dropdown>
                    ) : (
                        <></>
                    );
                },
            },
        ];

        /**
         *
         * @param {Object} a first object
         * @param {Object} b second object
         * @param {String} property Property to  the table
         * @returns {Array} returns the sorted one
         */
        const sortByProperty = (a, b, property) =>
            a[property] !== b[property]
                ? a[property] < b[property]
                    ? -1
                    : 1
                : 0;
        const filters = generateFilters();
        const columnArr = [
            {
                title: 'CASE ID',
                dataIndex: 'caseId',
                sorter: (a, b) => a.caseId.length - b.caseId.length,
                sortOrder: sortedInfo.field === 'caseId' && sortedInfo.order,
                filteredValue: filteredInfo.caseId || null,
                filters: filters?.caseId || [],
                onFilter: (value, record) =>
                    record?.caseId?.indexOf(value) === 0,
                ...getColumnSearchProps('caseId', 'CASE ID'),
            },
            {
                title: 'EXTERNAL ID',
                dataIndex: 'externalCaseId',
                sorter: (a, b) =>
                    a.externalCaseId?.length - b.externalCaseId?.length,
                sortOrder:
                    sortedInfo?.field === 'externalCaseId' && sortedInfo?.order,
                filteredValue: filteredInfo?.externalCaseId || null,
                filters: filters?.externalCaseId || [],
                onFilter: (value, record) =>
                    record?.externalCaseId?.indexOf(value) === 0,
                ...getColumnSearchProps('externalCaseId', 'EXTERNAL ID'),
            },
            {
                title: 'BAN',
                dataIndex: 'billingAccountNumber',
                sortOrder:
                    sortedInfo.field === 'billingAccountNumber' &&
                    sortedInfo.order,
                filteredValue: filteredInfo.billingAccountNumber || null,
                sorter: (a, b) =>
                    a.billingAccountNumber - b.billingAccountNumber,
                filters: filters?.billingAccountNumber || [],
                onFilter: (value, record) => {
                    return record?.billingAccountNumber === value;
                },
                ...getColumnSearchProps('billingAccountNumber', 'BAN'),
            },
            {
                title: 'CTN',
                dataIndex: 'phoneNumber',
                sortOrder:
                    sortedInfo.field === 'phoneNumber' && sortedInfo.order,
                filteredValue: filteredInfo.phoneNumber || null,
                sorter: (a, b) => a.phoneNumber - b.phoneNumber,
                filters: filters?.phoneNumber || [],
                onFilter: (value, record) => {
                    return record?.phoneNumber === value;
                },
                ...getColumnSearchProps('phoneNumber', 'Phone Number'),
            },
            {
                title: 'IMEI',
                dataIndex: 'imei',
                sortOrder: sortedInfo.field === 'imei' && sortedInfo.order,
                filteredValue: filteredInfo.imei || null,
                sorter: (a, b) => a.imei - b.imei,
                filters: filters?.imei || [],
                onFilter: (value, record) => {
                    return record?.imei === value;
                },
                ...getColumnSearchProps('imei', 'IMEI'),
            },
            {
                title: 'CREATED',
                dataIndex: 'createdAt',
                sortOrder: sortedInfo.field === 'createdAt' && sortedInfo.order,
                filteredValue: filteredInfo.createdAt || null,
                sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                filters: filters?.createdAt || [],
                onFilter: (value, record) =>
                    record?.createdAt?.indexOf(value) === 0,
                ...getColumnSearchProps('createdAt', 'CREATED', true),
            },
            {
                title: 'ASSIGNED TO',
                dataIndex: 'assignedTo',
                sortOrder:
                    sortedInfo.field === 'assignedTo' && sortedInfo.order,
                filteredValue: filteredInfo.assignedTo || null,
                sorter: (a, b) => sortByProperty(a, b, 'assignedTo'),
                filters: filters?.assignedTo || [],
                onFilter: (value, record) =>
                    record?.assignedTo?.indexOf(value) === 0,
                ...getColumnSearchProps('assignedTo', 'ASSIGNED TO'),
            },
            {
                title: 'CATEGORY',
                dataIndex: 'category',
                sortOrder: sortedInfo.field === 'category' && sortedInfo.order,
                filteredValue: filteredInfo.category || null,
                sorter: (a, b) => sortByProperty(a, b, 'category'),
                filters: filters?.category || [],
                onFilter: (value, record) =>
                    record?.category?.indexOf(value) === 0,
            },
            {
                title: 'CASE CONDITION',
                dataIndex: 'condition',
                sortOrder: sortedInfo.field === 'condition' && sortedInfo.order,
                filteredValue: filteredInfo.condition || null,
                sorter: (a, b) => sortByProperty(a, b, 'condition'),
                filters: filters?.condition || [],
                onFilter: (value, record) =>
                    record?.condition?.indexOf(value) === 0,
            },
            {
                title: 'SUBCATEGORY1',
                dataIndex: 'subCategory1',
                sortOrder:
                    sortedInfo.field === 'subCategory1' && sortedInfo.order,
                filteredValue: filteredInfo.subCategory1 || null,
                sorter: (a, b) => sortByProperty(a, b, 'subCategory1'),
                filters: filters?.subCategory1 || [],
                onFilter: (value, record) =>
                    record?.subCategory1?.indexOf(value) === 0,
            },
            {
                title: 'SUBCATEGORY2',
                dataIndex: 'subCategory2',
                sortOrder:
                    sortedInfo.field === 'subCategory2' && sortedInfo.order,
                filteredValue: filteredInfo.subCategory2 || null,
                sorter: (a, b) => sortByProperty(a, b, 'subCategory2'),
                filters: filters?.subCategory2 || [],
                onFilter: (value, record) =>
                    record?.subCategory2?.indexOf(value) === 0,
            },
            {
                title: 'STATUS',
                dataIndex: 'status',
                sortOrder: sortedInfo.field === 'status' && sortedInfo.order,
                filteredValue: filteredInfo.status || null,
                filters: filters?.status || [],
                onFilter: (value, record) =>
                    record?.status?.indexOf(value) === 0,

                sorter: (a, b) => sortByProperty(a, b, 'status'),
                render: (value) => {
                    return (
                        <div
                            className={classnames(
                                'row-status',
                                value === 'new' && 'row-status-new'
                            )}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                title: 'LAST UPDATED',
                dataIndex: 'closedAt',
                sortOrder: sortedInfo.field === 'closedAt' && sortedInfo.order,
                filteredValue: filteredInfo.closedAt || null,
                sorter: (a, b) => new Date(a.closedAt) - new Date(b.closedAt),
                filters: filters?.closedAt || [],
                onFilter: (value, record) =>
                    record?.closedAt?.indexOf(value) === 0,
                ...getColumnSearchProps('closedAt', 'LAST UPDATED', true),
            },

            {
                title: 'PRIORITY',
                dataIndex: 'priority',
                sortOrder: sortedInfo.field === 'priority' && sortedInfo.order,
                filteredValue: filteredInfo.priority || null,
                sorter: (a, b) => sortByProperty(a, b, 'priority'),
                render: (value) => {
                    return value ? (
                        <Tag
                            style={{
                                color: Priorities[value]?.color,
                                background: 'white',
                                fontWeight: 500,
                                border: `1.5px solid ${Priorities[value]?.color}`,
                            }}
                        >
                            {Priorities[value]?.title ?? value}
                        </Tag>
                    ) : null;
                },
                filters: filters.priority || [],
                onFilter: (value, record) =>
                    record?.priority?.indexOf(value) === 0,
            },
            {
                title: 'First Name',
                dataIndex: 'firstName',
                sortOrder: sortedInfo.field === 'firstName' && sortedInfo.order,
                filteredValue: filteredInfo.firstName || null,
                sorter: (a, b) => sortByProperty(a, b, 'firstName'),
                filters: filters.firstName || [],
                onFilter: (value, record) =>
                    record?.firstName?.indexOf(value) === 0,
                ...getColumnSearchProps('firstName', 'First Name'),
            },
            {
                title: 'Last Name',
                dataIndex: 'lastName',
                sortOrder: sortedInfo.field === 'lastName' && sortedInfo.order,
                filteredValue: filteredInfo.lastName || null,
                sorter: (a, b) => sortByProperty(a, b, 'lastName'),
                filters: filters.lastName || [],
                onFilter: (value, record) =>
                    record?.lastName?.indexOf(value) === 0,
                ...getColumnSearchProps('lastName', 'Last Name'),
            },

            {
                title: 'PROBLEM DATE/TIME',
                dataIndex: 'problemDateTime',
                sortOrder:
                    sortedInfo.field === 'problemDateTime' && sortedInfo.order,
                filteredValue: filteredInfo.problemDateTime || null,
                sorter: (a, b) =>
                    new Date(a.problemDateTime) - new Date(b.problemDateTime),
                onFilter: (value, record) =>
                    record?.problemDateTime?.indexOf(value) === 0,
                ...getColumnSearchProps(
                    'problemDateTime',
                    'PROBLEM DATE/TIME',
                    true
                ),
            },
            {
                title: 'DEVICE TYPE',
                dataIndex: 'deviceType',
                sortOrder:
                    sortedInfo.field === 'deviceType' && sortedInfo.order,
                filteredValue: filteredInfo.deviceType || null,
                sorter: (a, b) => sortByProperty(a, b, 'deviceType'),
                filters: filters.deviceType || [],
                onFilter: (value, record) =>
                    record?.deviceType?.indexOf(value) === 0,
            },
            {
                title: 'CITY',
                dataIndex: 'city',
                sortOrder: sortedInfo.field === 'city' && sortedInfo.order,
                filteredValue: filteredInfo.city || null,
                sorter: (a, b) => sortByProperty(a, b, 'city'),
                filters: filters.city || [],
                onFilter: (value, record) => record?.city?.indexOf(value) === 0,
            },
            {
                title: 'STATE',
                dataIndex: 'state',
                sortOrder: sortedInfo.field === 'state' && sortedInfo.order,
                filteredValue: filteredInfo.state || null,
                filters: filters.state || [],
                sorter: (a, b) => sortByProperty(a, b, 'state'),
                onFilter: (value, record) =>
                    record?.state?.indexOf(value) === 0,
            },
            {
                title: 'CRICKET DEVICE',
                dataIndex: 'cricketDevice',
                sortOrder:
                    sortedInfo.field === 'cricketDevice' && sortedInfo.order,
                filteredValue: filteredInfo.cricketDevice || null,
                filters: filters.cricketDevice || [],
                sorter: (a, b) => sortByProperty(a, b, 'cricketDevice'),
                onFilter: (value, record) =>
                    record?.cricketDevice?.indexOf(value) === 0,
            },
        ];

        columnArr.forEach((item) => {
            if (selectedColumns.indexOf(item.dataIndex) !== -1) {
                columns.push(item);
            }
        });
        columns.push({
            width: 32,
            title: (
                <Dropdown
                    align="right"
                    menu={
                        <Menu>
                            {columnOptions.map((col) => (
                                <Menu.Item key={col.value}>
                                    <Checkbox
                                        checked={
                                            selectedColumns.indexOf(
                                                col.value
                                            ) !== -1
                                        }
                                        onClick={() => {
                                            const index = selectedColumns.indexOf(
                                                col.value
                                            );
                                            if (index === -1) {
                                                selectedColumns.push(col.value);
                                            } else {
                                                selectedColumns.splice(
                                                    index,
                                                    1
                                                );
                                            }
                                            setSelectedColumns([
                                                ...selectedColumns,
                                            ]);
                                        }}
                                    >
                                        {col.name}
                                    </Checkbox>
                                </Menu.Item>
                            ))}
                        </Menu>
                    }
                >
                    <MoreOutlined style={{ fontSize: 20 }} />
                </Dropdown>
            ),
            dataIndex: '',
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
                let indexValue = filters[key]?.findIndex(
                    (ele) => ele.value === element[key]
                );
                if (indexValue === -1) {
                    filters[key]?.push({
                        value: element[key],
                        text:
                            key === 'closedAt'
                                ? formatDateToUs(element[key])
                                : element[key],
                    });
                }
            });
        }
        return filters;
    }

    const onSelectChange = (selectedRow, selectedRecords) => {
        const selectedRowData = data.find((dt) => dt.caseId === selectedRow[0]);
        setSelectedRowKeys(selectedRow);
        setSelectedRows(selectedRecords);
        onChecked(selectedRowData);
    };

    const rowSelection = {
        selectedRowKeys,
        columnWidth: 32,
        onChange: onSelectChange,
    };

    return (
        <Space className="cm-table-wrapper" size={30} direction="vertical">
            <Col span={24} className="total-counting-container">
                <Space size={8}>
                    <ProfileOutlined />
                    <span className="cm-pending-ebb-text">
                        <span className="cm-pending-ebb-bold">
                            {previousPayload?.assignedTeam
                                ? previousPayload?.assignedTeam + ' - '
                                : ''}

                            {`Total `}
                            {filteredData ? filteredData?.length : 0}
                        </span>
                        {` cases`}
                    </span>
                </Space>
            </Col>
            <Space className="cm-table-filters" size={8}>
                <div className="input-boxes-container">
                    {selectedRowKeys?.length > 0 && !cmMode ? (
                        <div className="filter-row">
                            <Dropdown
                                menu={
                                    <Menu>
                                        <Menu.Item
                                            onClick={() => {
                                                onAssign(selectedRows, true);
                                            }}
                                            disabled={!privileges.Dispatch}
                                        >
                                            Assign
                                        </Menu.Item>

                                        <Menu.Item
                                            onClick={() => {
                                                onDispatch(selectedRows, true);
                                            }}
                                            disabled={!privileges.Dispatch}
                                        >
                                            Dispatch
                                        </Menu.Item>
                                        <Menu.Item
                                            onClick={() => {
                                                onClaimBulk(selectedRows, true);
                                            }}
                                            disabled={!privileges.Dispatch}
                                        >
                                            Claim
                                        </Menu.Item>
                                    </Menu>
                                }
                            >
                                <div className="row-actions-btn">
                                    <MoreOutlined className="row-actions-btn-icon" />
                                </div>
                            </Dropdown>
                        </div>
                    ) : null}
                    <div>
                        {showSearchFilter && (
                            <Input
                                className="search-box"
                                value={searchText}
                                placeholder="Enter case ID to search"
                                onChange={(e) => setSearchText(e.target.value)}
                                suffix={
                                    <SearchOutlined
                                        style={{
                                            color: searchText
                                                ? '#1890ff'
                                                : 'rgba(0, 0, 0, 0.45)',
                                        }}
                                    />
                                }
                            />
                        )}
                    </div>
                    <div className="refresh-icon-container">
                        <Tooltip placement="topRight" title="Refresh Cases">
                            <SyncOutlined
                                className="refresh-icon"
                                onClick={() =>
                                    postCasesSearch(
                                        !cmMode
                                            ? previousPayload
                                            : {
                                                  billingAccountNumber:
                                                      window[
                                                          sessionStorage.tabId
                                                      ].NEW_BAN,
                                              },
                                        false,
                                        true
                                    )
                                }
                            />
                        </Tooltip>
                    </div>
                </div>

                <div>
                    {/* {cmMode ? (
                        <CSVLink
                            filename="Case_Management.csv"
                            headers={csvHeaders}
                            data={filteredData}
                        >
                            <Button type="text" className="text-green">
                                <ExportOutlined /> Export
                            </Button>
                        </CSVLink>
                    ) : ( */}
                    <Input
                        placeholder="Input File Name"
                        required
                        className={`cm-file-input ${
                            showInputFileName ? '' : 'd-none'
                        }`}
                        onChange={(e) => {
                            setFileName(e.target.value);
                        }}
                        value={fileName}
                    />
                    <ExportTableButton
                        dataSource={filteredData}
                        columns={caseManagementCSVHeaders}
                        fileName={fileName}
                        btnProps={{
                            type: 'primary',
                            icon: <FileExcelOutlined />,
                            className: 'd-none',
                            ref: exportButton,
                        }}
                        showColumnPicker
                    >
                        GO
                    </ExportTableButton>
                    <Button
                        type="primary"
                        className={showInputFileName ? '' : 'd-none'}
                        icon={<FileExcelOutlined />}
                        onClick={() => {
                            exportButton.current.click();
                            setShowInputFileName(false);
                        }}
                    >
                        Go
                    </Button>
                    <Button
                        type="primary"
                        className={showInputFileName ? 'd-none' : ''}
                        icon={<FileExcelOutlined />}
                        onClick={() => {
                            setFileName('');
                            setShowInputFileName(true);
                        }}
                    >
                        Export to CSV
                    </Button>
                    {/* )} */}
                    <RangePicker
                        className="filter-item"
                        value={dates}
                        style={{ minwidth: 180 }}
                        onChange={(value) => setDates(value)}
                    />
                    <Select
                        className="filter-item"
                        style={{ width: 180 }}
                        placeholder="Select Assigned To"
                        value={owner}
                        onChange={(value) => setOwner(value)}
                    >
                        {ownerOptions.map((owner) => (
                            <Option value={owner.value} key={owner.value}>
                                {owner.name}
                            </Option>
                        ))}
                    </Select>
                    <Button
                        className="filter-item"
                        onClick={() => handleClear()}
                    >
                        Clear Filters
                    </Button>
                    {selectedRowKeys?.length > 0 && (
                        <Button
                            className="bulk-dispatch-button"
                            onClick={() => {
                                onDispatch(selectedRows, true);
                            }}
                        >
                            <ArrowUpOutlined className="bulk-dispatch-icon" /> Dispatch
                        </Button>
                    )}

                    {/* <Select style={{ width: 140 }} placeholder="Group by" disabled>
                    {groupByOptions.map((g) => (
                        <Option value={g.value} key={g.value}>
                            {g.name}
                        </Option>
                    ))}
                </Select> */}
                </div>
            </Space>
            <Table
                loading={loading}
                className="cm-table"
                rowClassName={(record, index) =>
                    record?.assignedTo === '' ||
                    record?.assignedTo === undefined
                        ? ''
                        : 'blue-row'
                }
                columns={getColumns()}
                dataSource={filteredData}
                pagination={{
                    position: 'bottom',
                }}
                onChange={handleChange}
                rowSelection={rowSelection}
                size="middle"
                rowKey="caseId"
                locale={{ emptyText: emptyText }}
            />
        </Space>
    );
}
