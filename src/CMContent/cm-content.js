/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CMEdit from '../CMEdit/cm-edit';
import CMLinkDialog from '../CMLinkDialog/cm-link-dialog';
import CMAssignDialog from '../CMAssignDialog/cm-assign-dialog';
import { notification, Modal } from 'antd';
import SplitPane from 'react-split-pane';
import arrayToValues from '../helpers/arrayToValues';
import CMTable from '../CMTable/cm-table';
import { MessageBus } from '@ivoyant/component-message-bus';
import { cache } from '@ivoyant/component-cache';
import isEqual from 'lodash.isequal';
import EBBTable from '../CMEbb/Table';

import './styles.css';

export default function CMContent({ data, datasources, properties, ...props }) {
    const reOpenStateDuration =
        props?.reOpenStateDuration || properties?.reOpenStateDuration;
    const editDisabledStates =
        props?.editDisabledStates || properties?.editDisabledStates;
    const recentActivitiesLength =
        props?.recentActivitiesLength || properties?.recentActivitiesLength;
    const metadata = props?.metadata || data?.data?.metadata || [];
    const {
        searchCasesWorkflow,
        updateCaseWorkflow,
        searchUsersWorkflow,
        customerInfoByQueryWorkflow,
        assignDispatchWorkflow,
        caseCategoriesConfig,
    } = properties;
    const caseHistoryMode = props?.metadata || props?.caseHistory;
    const cacheId = !caseHistoryMode
        ? 'caseManagement'
        : `caseHistory-${window[window.sessionStorage?.tabId].NEW_BAN}`;
    const prevValue = cache.get(cacheId, {});
    const [assignRow, setAssignRow] = useState(null);
    const [assignType, setAssignType] = useState(null);
    const [linkRow, setLinkRow] = useState(null);
    const [error, setError] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentCase, setCurrentCase] = useState(
        prevValue?.currentCase || null
    );
    const [tabKey, setTabKey] = useState('detail');
    const [editRow, setEditRow] = useState(prevValue?.editRow || null);
    const [isEdit, setEdit] = useState(prevValue?.edit || false);
    const [caseLoading, setCaseLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [caseError, setCaseError] = useState(null);
    const [getCasesData, setGetCasesData] = useState(prevValue?.cases || []);
    const [showTable, setShowTable] = useState(true);
    const location = useLocation();
    const [emptyText, setEmptyText] = useState(null);
    const [customerInfoLoading, setCustomerInfoLoading] = useState(false);
    const [customerInfo, setCustomerInfo] = useState(prevValue?.customerInfo);
    const [customerInfoError, setCustomerInfoError] = useState('');
    const [caseUpdateLoading, setCaseUpdateLoading] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState(null);
    const [isBulk, setIsBulk] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    let { profile, attId } = window[
        window.sessionStorage?.tabId
    ].COM_IVOYANT_VARS;

    const [previousPayload, setPreviousPayload] = useState({
        assignedTo: attId,
    });

    /** Makes the search call based on the queue and recenty activity click */
    const filterBySelectedQueue = (subscriptionId, topic, data) => {
        if (data?.body?.selectedQueues?.includes('AssignedToMe')) {
            PostCasesSearch({ assignedTo: attId });
        } else if (data?.body?.selectedQueues) {
            PostCasesSearch({ assignedTeam: data?.body?.selectedQueues[0] });
        }

        if (data?.body?.activity) {
            PostCasesSearch({ caseId: data?.body?.activity });
        }
        handleCloseEdit();
    };

    // Triggers on cm-queue-select and recent activity
    useEffect(() => {
        MessageBus.subscribe(
            'cm-queue-select',
            'CM.QUEUE.SELECT',
            filterBySelectedQueue
        );

        return () => {
            MessageBus.unsubscribe('cm-queue-select');
        };
    }, []);

    // Updates the cases data or calls the search API intially and on route change
    useEffect(() => {
        if (location?.state?.routeData?.searchData) {
            setGetCasesData(JSON.parse(location?.state?.routeData?.searchData));
            setPreviousPayload(
                location?.state?.routeData?.payload
                    ? JSON.parse(location?.state?.routeData?.payload)
                    : {
                          assignedTo: attId,
                      }
            );
        } else if (location?.state?.routeData?.queueData) {
            handlePostSearch(location?.state?.routeData?.queueData);
        } else {
            if (getCasesData?.length === 0 && !caseHistoryMode) {
                PostCasesSearch({ assignedTo: attId });
            }
            if (getCasesData?.length === 0 && caseHistoryMode) {
                PostCasesSearch({
                    billingAccountNumber:
                        window[window.sessionStorage?.tabId].NEW_BAN,
                });
            }
        }

        document.title = 'Case Management - Voyage';
        return () => {
            MessageBus.unsubscribe('SEARCHCASES');
        };
    }, [location]);

    const handleSearchCasesResponse = (
        successStates,
        errorStates,
        caseOnly,
        refresh
    ) => (subscriptionId, topic, eventData, closure) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                const response = eventData.event.data.data;
                if (caseOnly) {
                    setCurrentCase(response[0]);
                    cache.put(cacheId, {
                        ...prevValue,
                        currentCase: response[0],
                    });
                    setCaseLoading(false);
                } else if (refresh) {
                    if (!isEqual(response, getCasesData)) {
                        cache.put(cacheId, {
                            ...prevValue,
                            currentCase: response[0],
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
                    cache.put(cacheId, {
                        cases: response,
                        currentCase: null,
                        customerInfo: null,
                        edit: null,
                        editRow: null,
                        caseEditValues: null,
                    });
                }
            }
            if (isFailure) {
                if (caseOnly) {
                    setCaseLoading(false);
                    setCaseError(
                        'Error loading the case data. Please try again later'
                    );
                } else {
                    setGetCasesData([]);
                    cache.put(cacheId, {
                        cases: [],
                    });
                    setEmptyText(
                        eventData?.event?.data?.message ||
                            'Something went wrong. Please try again later.'
                    );
                    setTableLoading(false);
                }
            }
            MessageBus.unsubscribe(subscriptionId);
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
            if (body?.assignedTeam) setSelectedQueue(body?.assignedTeam);
            else setSelectedQueue(null);
            setPreviousPayload(
                caseHistoryMode
                    ? {
                          billingAccountNumber:
                              window[window.sessionStorage?.tabId].NEW_BAN,
                      }
                    : body
            );
            setTableLoading(true);
        }
        const requestBody = JSON.stringify({
            ...body,
            includeClosed:
                !caseOnly && !body?.caseId && !body?.billingAccountNumber
                    ? false
                    : true,
        });
        const submitEvent = 'SUBMIT';
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = searchCasesWorkflow;
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleSearchCasesResponse(
                successStates,
                errorStates,
                caseOnly,
                refresh
            )
        );
        MessageBus.send(
            'WF.'.concat(workflow).concat('.').concat(submitEvent),
            {
                header: {
                    registrationId: workflow,
                    workflow: workflow,
                    eventType: submitEvent,
                },
                body: {
                    datasource: datasources[datasource],
                    request: {
                        body: requestBody,
                    },
                    responseMapping,
                },
            }
        );
    };

    const handlePostCustomerInfo = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                const response = eventData.event.data.data;
                setCustomerInfoLoading(false);
                setCustomerInfo(response?.account);
                cache.put(cacheId, {
                    ...prevValue,
                    customerInfo: response?.account,
                });
            }
            if (isFailure) {
                setCustomerInfoError(
                    eventData?.event?.data?.message ||
                        'Error loading the customer info. Please try again later!'
                );
                setCustomerInfoLoading(false);
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    /**
     *
     * @param {String} ban
     * @returns {Object} returned response
     */
    const PostCustomerInfo = (ban) => {
        if (ban?.includes('C') || ban === undefined || (ban && isNaN(ban)))
            return;
        setCustomerInfo(null);
        setCustomerInfoLoading(true);
        setCustomerInfoError('');
        const submitEvent = 'SUBMIT';
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
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
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handlePostCustomerInfo(successStates, errorStates)
        );
        MessageBus.send(
            'WF.'.concat(workflow).concat('.').concat(submitEvent),
            {
                header: {
                    registrationId: workflow,
                    workflow: workflow,
                    eventType: submitEvent,
                },
                body: {
                    datasource: datasources[datasource],
                    request: {
                        body: requestBody,
                    },
                    responseMapping,
                },
            }
        );
    };

    const editTableRow = (editRowObject) => {
        cache.put(cacheId, {
            ...prevValue,
            editRow: editRowObject,
            edit: true,
        });
        setEditRow(editRowObject);
        setEdit(true);
    };

    const onRowSelected = (selectedRowData) => {
        setEditRow(selectedRowData);
        setEdit(false);
        cache.put(cacheId, {
            ...prevValue,
            editRow: selectedRowData,
            edit: false,
        });
    };

    const handleUpdateCaseResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                cache.put(cacheId, {
                    ...prevValue,
                    currentCase: null,
                    customerInfo: null,
                    edit: null,
                    editRow: null,
                    caseEditValues: null,
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
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    // Updates the case on Assign and Edit and Dispatch actions
    const handleCaseUpdate = (values) => {
        setError(null);
        setCaseUpdateLoading(true);
        const requestBody = JSON.stringify(values);
        const submitEvent = 'SUBMIT';
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = updateCaseWorkflow;
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: workflow,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            workflow,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleUpdateCaseResponse(successStates, errorStates)
        );
        MessageBus.send(
            'WF.'.concat(workflow).concat('.').concat(submitEvent),
            {
                header: {
                    registrationId: workflow,
                    workflow: workflow,
                    eventType: submitEvent,
                },
                body: {
                    datasource: datasources[datasource],
                    request: {
                        body: requestBody,
                    },
                    responseMapping,
                },
            }
        );
    };

    const showSuccessNotification = (message) => {
        notification['success']({
            message: 'Success',
            description: message ? message : 'Updated case successfully!',
        });
    };

    const showErrorNotification = (message) => {
        notification['error']({
            message: 'Error',
            description: message || 'Error updatating case!',
        });
    };

    const handleCloseEdit = () => {
        cache.put(cacheId, {
            ...prevValue,
            edit: null,
            editRow: null,
            caseEditValues: null,
        });
        setEdit(null);
        setEditRow(null);
        setSelectedRowKeys([]);
    };

    const handleChangeEdit = (value) => {
        setEdit(value);
        cache.put(cacheId, {
            ...prevValue,
            edit: value,
        });
        setError(null);
    };

    const handleCancelEdit = () => {
        cache.put(cacheId, {
            ...prevValue,
            edit: null,
            caseEditValues: null,
        });
        setEdit(false);
        setError(null);
    };

    const handleChangeTab = (key) => {
        setTabKey(key);
    };

    const handleEditValuesChange = (values) => {
        cache.put(cacheId, {
            ...prevValue,
            caseEditValues: values,
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

    const handleClaim = (row) => {
        const claimBody = {
            status: row?.caseHistory[0]?.status,
            state: row?.caseHistory[0]?.state,
            summary: row?.caseHistory[0]?.summary || `Case claimed by ${attId}`,
            caseId: row?.caseId,
            assignedTo: attId,
            updatedBy: attId,
        };

        let isAlreadyAssigned = row?.caseHistory[0]?.assignedTo;
        isAlreadyAssigned
            ? showModal(
                  'Case is already claimed by another user, do you want to proceed?',
                  claimBody
              )
            : handleCaseUpdate(claimBody);
    };

    function showModal(msg, claimBody) {
        Modal.confirm({
            title: 'Confirm',
            content: msg,
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
                handleCaseUpdate(claimBody);
            },
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
        const activities = localStorage.getItem('recentActivity')
            ? JSON.parse(localStorage.getItem('recentActivity'))
            : [];
        if (activities?.length === recentActivitiesLength) {
            activities.pop();
        }
        if (activities?.includes(id)) {
            let values = [];
            activities.map((caseId) => {
                if (caseId === id) {
                    values.unshift(id);
                } else {
                    values.push(caseId);
                }
            });
            localStorage.setItem('recentActivity', JSON.stringify(values));
        } else {
            localStorage.setItem(
                'recentActivity',
                JSON.stringify([id, ...activities])
            );
        }
    };

    // Filtering privilages of the account type from the metdata
    const privilegesOptions = metadata
        ?.find(({ domain }) => domain === 'casePrivileges')
        ?.metadata?.categories?.find(({ name }) => name === profile);
    const privileges = arrayToValues(privilegesOptions);

    return privileges?.View || caseHistoryMode ? (
        sessionStorage.getItem('ebbTable') === 'true' ? (
            <EBBTable />
        ) : (
            <div
                key={cacheId}
                className="cm-content-wrapper d-flex flex-column"
            >
                <SplitPane split="horizontal" className="cm-split-pane">
                    {showTable && (
                        <CMTable
                            key={cacheId}
                            data={getCasesData}
                            caseManagementCSVHeaders={
                                properties?.caseManagementCSVHeaders ||
                                props?.caseManagementCSVHeaders
                            }
                            ebbCSVHeaders={
                                properties?.ebbCSVHeaders ||
                                props?.ebbCSVHeaders
                            }
                            loading={tableLoading}
                            onEdit={editTableRow}
                            onChecked={onRowSelected}
                            onAssign={(row, isBulk) =>
                                handleAssign(row, 'Assign', isBulk)
                            }
                            onDispatch={(row, isBulk) =>
                                handleAssign(row, 'Dispatch', isBulk)
                            }
                            onClaimBulk={(row, isBulk) =>
                                handleAssign(row, 'Claim', isBulk)
                            }
                            postCasesSearch={(body, caseOnly, refresh) =>
                                PostCasesSearch(body, caseOnly, refresh)
                            }
                            onLink={(row) => setLinkRow(row)}
                            onCloseEdit={() => handleCloseEdit()}
                            selectedRowKeys={selectedRowKeys}
                            setSelectedRowKeys={(keys) =>
                                setSelectedRowKeys(keys)
                            }
                            showSearchFilter={true}
                            scroll={null}
                            emptyText={emptyText}
                            attId={attId}
                            privileges={privileges}
                            editDisabledStates={editDisabledStates}
                            reOpenStateDuration={reOpenStateDuration}
                            cmMode={caseHistoryMode}
                            onClaim={(row) => handleClaim(row)}
                            selectedQueue={selectedQueue}
                            previousPayload={previousPayload}
                            selectedRows={selectedRows}
                            setSelectedRows={setSelectedRows}
                        />
                    )}
                    {editRow && (
                        <CMEdit
                            selectedData={editRow}
                            error={error}
                            data={currentCase}
                            prevValue={prevValue}
                            caseLoading={
                                editRow?.caseId ===
                                prevValue?.currentCase?.caseId
                                    ? false
                                    : !currentCase && !caseError
                                    ? true
                                    : caseLoading
                            }
                            caseError={caseError}
                            setCurrentCase={() => {
                                setCustomerInfo(null);
                                setCurrentCase(null);
                            }}
                            setRecentActivity={(id, ban) =>
                                handleRecentActivity(id, ban)
                            }
                            postCasesSearch={(body, ban) => {
                                PostCasesSearch(body, true);
                                !caseHistoryMode && PostCustomerInfo(ban);
                            }}
                            edit={isEdit}
                            tabKey={tabKey}
                            setEdit={(value) => handleChangeEdit(value)}
                            setError={setError}
                            onAssign={(type, row) => handleAssign(row, type)}
                            onUpdate={(value) => handleCaseUpdate(value)}
                            onLink={() => setLinkRow(editRow)}
                            showTable={showTable}
                            onToggle={() => setShowTable(!showTable)}
                            onCloseEdit={() => handleCloseEdit()}
                            onCancelEdit={() => handleCancelEdit()}
                            onTabChange={(value) => handleChangeTab(value)}
                            privileges={privileges}
                            metadata={metadata}
                            editDisabledStates={editDisabledStates}
                            reOpenStateDuration={reOpenStateDuration}
                            attId={attId}
                            onEditValuesChange={(value) =>
                                handleEditValuesChange(value)
                            }
                            customerInfo={customerInfo}
                            customerInfoLoading={customerInfoLoading}
                            customerInfoError={customerInfoError}
                            cmMode={caseHistoryMode}
                            accountStatuses={properties?.accountStatuses}
                            caseCategoriesConfig={caseCategoriesConfig}
                            bridgePayStatuses={properties?.bridgePayStatuses}
                            caseUpdateLoading={caseUpdateLoading}
                            onClaim={(row) => handleClaim(row)}
                            profile={profile}
                            selectedRows={selectedRows}
                        />
                    )}
                </SplitPane>
                {linkRow && (
                    <CMLinkDialog
                        visible
                        onCancel={() => setLinkRow(null)}
                        suggestions={getCasesData}
                    />
                )}
                {assignRow && (
                    <CMAssignDialog
                        visible
                        type={assignType}
                        error={error}
                        onAssign={(value) => handleCaseUpdate(value)}
                        onCancel={() => {
                            setError(null);
                            setAssignRow(null);
                        }}
                        data={assignRow}
                        currentCase={currentCase}
                        metadata={metadata}
                        attId={attId}
                        privilegesOptions={privilegesOptions}
                        selectedRows={selectedRows}
                        selectedRowKeys={selectedRowKeys}
                        assignDispatchWorkflow={assignDispatchWorkflow}
                        searchUsersWorkflow={searchUsersWorkflow}
                        errorOnBulkHit={properties?.errorOnBulkHit}
                        setSelectedRowKeys={setSelectedRowKeys}
                        setEdit={setEdit}
                        setEditRow={setEditRow}
                        setAssignRow={setAssignRow}
                        setCaseUpdateLoading={setCaseUpdateLoading}
                        datasources={datasources}
                        isBulk={isBulk}
                    />
                )}
            </div>
        )
    ) : (
        <div style={{ textAlign: 'center', margin: 24 }}>
            No Privileges to view the cases
        </div>
    );
}
