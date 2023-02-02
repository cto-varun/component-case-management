import React, { useState } from 'react';
import {
    Input,
    Modal,
    Space,
    Button,
    Alert,
    Select,
    notification,
    Form,
    AutoComplete,
} from 'antd';
import Notes from '@ivoyant/component-notes';
import { MessageBus } from '@ivoyant/component-message-bus';

import './styles.css';

const { Option } = AutoComplete;
export default function CMAssignDialog({
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
    selectedRows,
}) {
    const currentProfile =
        window[sessionStorage.tabId].COM_IVOYANT_VARS?.profile;
    const [form] = Form.useForm();
    const [queue, setQueue] = useState(
        data?.caseHistory[0]?.assignedTeam || ''
    );
    const [note, setNote] = useState('');
    const assignedTo = data?.caseHistory[0]?.assignedTo || data?.agentName;
    const [value, setValue] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [noteErrorMessage, setNoteErrorMessage] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [searchNameResults, setSearchNameResults] = useState([]);
    const [searchIdResults, setSearchIdResults] = useState([]);
    const [errorText, setErrorText] = useState();
    const [currentValue, setCurrentValue] = useState({ id: '', name: '' });

    const [onBulkResponse, setOnBulkResponse] = useState(false);
    let { attId } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;

    // fetching result for current profile for checking if dispatching without notes is enabled or not
    let dispatchWithoutNotes = metadata
        ?.find((mt) => mt.domain === 'profiles')
        ?.metadata?.categories?.find((ct) => ct?.name === currentProfile)
        ?.categories?.find(
            (ct) =>
                ct?.name === 'dispatchCaseWithoutNotes' &&
                (ct?.enable === true || ct?.enable === 'true')
        );

    const dispatchQueues = privilegesOptions?.categories?.find(
        ({ dispatchTo }) => dispatchTo
    )?.dispatchTo;

    let dispatchCategories = metadata
        ?.find((item) => item.domain === 'cases')
        ?.metadata?.categories?.find(
            ({ name }) =>
                name === data?.caseHistory?.length &&
                data?.caseHistory[0]?.category
        )
        ?.dispatchTo?.map((name) => {
            return { value: name, label: name };
        });

    // Queue options from caseprivileges or else caseAssignedTeam
    const intialQueueOptions = dispatchQueues
        ? dispatchQueues?.map((name) => {
              return { value: name, label: name };
          })
        : metadata
              ?.find((item) => item.domain === 'caseAssignedTeam')
              ?.metadata?.categories?.map((category) => {
                  return { value: category?.name, label: category?.name };
              }) || [];

    var namesOfCategories = new Set(
        intialQueueOptions.map(({ value }) => value)
    );

    const queueOptions = dispatchCategories?.length
        ? [
              ...intialQueueOptions,
              ...dispatchCategories.filter(
                  ({ value }) => !namesOfCategories.has(value)
              ),
          ]
        : intialQueueOptions;

    const handleChangeQueue = (value) => {
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
        setCurrentValue({ name: option.key, attId: option.value });
        setErrorMessage(null);
        setValue({ name: option.key, attId: option.value });
    };

    const handleSearchUsersResponse = (successStates, errorStates, type) => (
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
                        id: eventData.event.data.message,
                    });
                } else {
                    setSearchNameResults([]);
                    setErrorText({
                        name: eventData.event.data.message,
                    });
                }
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleSearchUsers = (type, value) => {
        if (
            (type === 'attId' && value?.length >= 4) ||
            (type === 'name' && value?.length >= 3)
        ) {
            const requestBody = JSON.stringify(
                type === 'attId' ? { attId: value } : { name: value }
            );
            const submitEvent = 'SUBMIT';
            const {
                workflow,
                datasource,
                successStates,
                errorStates,
                responseMapping,
            } = searchUsersWorkflow;
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
                handleSearchUsersResponse(successStates, errorStates, type)
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
        }
    };
    function showModal(msg) {
        Modal.confirm({
            title: 'Confirm',
            content: msg,
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
                bulkAssign();
            },
        });
    }

    const getProfileAuthentication = () => {
        if (!dispatchWithoutNotes) {
            if (note) return true;
            else return false;
        } else return true;
    };
    const handleUpdate = () => {
        if (isBulk) {
            if (
                (type === 'Dispatch' && queue && getProfileAuthentication()) ||
                (type === 'Assign' && value?.attId && note) ||
                (type === 'Claim' && note)
            ) {
                if (type === 'Claim') {
                    let isAlreadyAssigned = false;
                    for (const currentRow of selectedRows) {
                        if (currentRow?.assignedTo) {
                            isAlreadyAssigned = true;
                        }
                    }
                    if (isAlreadyAssigned) {
                        showModal(
                            'One or more cases you selected are claimed by another user, do you want to proceed?'
                        );
                    } else {
                        bulkAssign();
                    }
                } else {
                    bulkAssign();
                }
            } else {
                if (type === 'Assign' && !value?.attId)
                    setErrorMessage('Please assign to someone!');
                else if (type === 'Dispatch' && !queue)
                    setErrorMessage('Please select the queue');
                else if (type === 'Claim' && !note)
                    setNoteErrorMessage('Note is required');
                else if (!note) setNoteErrorMessage('Notes is required');
            }
        } else {
            if (
                (type === 'Dispatch' &&
                    queue &&
                    getProfileAuthentication() &&
                    queue !== data?.caseHistory[0]?.assignedTeam) ||
                (type === 'Assign' && value?.attId && note)
            ) {
                onAssign &&
                    onAssign({
                        caseId: data.caseId,
                        updatedBy: attId,
                        summary:
                            note ||
                            data?.caseHistory[0]?.summary ||
                            data.description,
                        status: data?.caseHistory[0]?.status,
                        state: data?.caseHistory[0]?.state,
                        priority: data?.caseHistory[0]?.priority,
                        assignedTo: type === 'Assign' ? value?.attId : '',
                        assignedTeam:
                            type === 'Dispatch'
                                ? queue
                                : data?.caseHistory[0]?.assignedTeam || '',
                        category:
                            data.category || data?.caseHistory[0]?.category,
                        subCategory1:
                            data.subCategory1 ||
                            data?.caseHistory[0]?.subCategory1,
                        subCategory2:
                            data.subCategory2 ||
                            data?.caseHistory[0]?.subCategory2,
                    });
            } else {
                if (type === 'Assign' && !value?.attId) {
                    setErrorMessage('Please enter new case worker!');
                } else if (
                    type === 'Dispatch' &&
                    (!queue || queue === data?.caseHistory[0]?.assignedTeam)
                ) {
                    setErrorMessage(
                        queue
                            ? 'Case is already assigned to this queue'
                            : 'Please select the queue'
                    );
                } else if (!note) {
                    setNoteErrorMessage('Notes is required');
                }
            }
        }
    };

    const handleBulkResponse = (successStates, errorStates) => (
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
                setOnBulkResponse(eventData?.event?.data?.data);
                // setSelectedRowKeys([]);
                setApiError(null);
            }
            if (isFailure) {
                setApiError(eventData?.event?.data?.message || errorOnBulkHit);
            }
            setCaseUpdateLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    function bulkAssign() {
        const {
            workflow,
            datasource,
            successStates,
            errorStates,
            responseMapping,
        } = assignDispatchWorkflow;
        const submitEvent = 'SUBMIT';
        setCaseUpdateLoading(true);
        let body = {
            caseIds: selectedRowKeys,
            summary: note,
            assignedTo:
                type === 'Assign'
                    ? value?.attId || ''
                    : type === 'Claim'
                    ? attId || ''
                    : '',
            assignedTeam: queue || '',
            updatedBy:
                window[window.sessionStorage?.tabId].COM_IVOYANT_VARS?.attId,
        };

        if (type === 'Assign' || type === 'Claim') delete body.assignedTeam;
        else if (type === 'Dispatch') delete body.assignedTo;

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
            handleBulkResponse(successStates, errorStates)
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
                        body: body,
                    },
                    responseMapping,
                },
            }
        );
    }

    return (
        <Modal
            className="cm-assign-case-modal"
            title={
                <div className="cm-assign-case-header">
                    {type} {isBulk ? 'Cases' : 'Case'}
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={780}
        >
            <Form name="case-assign" form={form} layout="vertical">
                {!isBulk ? (
                    <div className="meta-data d-flex flex-row align-items-center">
                        <div className="id-wrapper" style={{ marginRight: 24 }}>
                            # {data.caseId}
                        </div>
                        <div
                            className="d-flex flex-row align-items-center"
                            style={{ flex: 1, justifyContent: 'space-between' }}
                        >
                            <div>CTN : {data.phoneNumber}</div>
                            <div>BAN : {data.billingAccountNumber}</div>
                            <div>
                                Created on :{' '}
                                {new Date(data.createdAt).toLocaleString()}
                            </div>
                            <div>
                                Updated By :{' '}
                                {data.caseHistory[0]?.updatedBy ||
                                    data.createdBy}
                            </div>
                        </div>
                    </div>
                ) : null}
                <div className="d-flex flex-row align-items-center edit-box-rows">
                    {!isBulk ? (
                        <Form.Item label="Owner">
                            <Input
                                value={assignedTo}
                                style={{ width: 80 }}
                                readOnly
                            />
                        </Form.Item>
                    ) : null}
                    {renderRowItem()}
                    {value?.name && (
                        <div
                            className="edit-row-item"
                            style={{ width: '100%' }}
                        >
                            <div style={{ width: '100%' }}>
                                Assigning to : {value?.name} ({value?.attId})
                            </div>
                        </div>
                    )}
                    <div className="edit-row-item" style={{ width: '100%' }}>
                        <div style={{ width: '100%' }}>
                            <Form.Item
                                label="Notes"
                                name="Note"
                                rules={[
                                    {
                                        required:
                                            type === 'Dispatch' &&
                                            dispatchWithoutNotes
                                                ? false
                                                : true,
                                    },
                                ]}
                            >
                                <Notes
                                    style={{
                                        height: 120,
                                        marginBottom: 48,
                                    }}
                                    theme="snow"
                                    value={note}
                                    onChange={(e) => {
                                        setNote(e);
                                        setNoteErrorMessage(null);
                                    }}
                                    placeholder="Enter note ( maximum 1500 characters )"
                                />
                            </Form.Item>
                        </div>
                    </div>
                </div>
                {error && <Alert message={error} type="error" />}
                {errorMessage && (
                    <div className="form-error-text ">{errorMessage}</div>
                )}
                {noteErrorMessage && (
                    <div className="form-error-text ">{noteErrorMessage}</div>
                )}
                {apiError && <div className="form-error-text ">{apiError}</div>}
                {renderBulkResponse()}
                <div className="d-flex flex-row align-items-center justify-content-between action-buttons">
                    <Space size={10}>
                        {!onBulkResponse ? (
                            <Button
                                htmlType="submit"
                                className="submit-button"
                                onClick={() => handleUpdate()}
                            >
                                {type}
                            </Button>
                        ) : null}
                        <Button className="cancel-button" onClick={onCancel}>
                            {onBulkResponse ? 'Close' : 'Cancel'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );

    function renderBulkResponse() {
        if (onBulkResponse) {
            return (
                <div>
                    {Object.keys(onBulkResponse)?.map((status, index) => {
                        return (
                            <div key={index}>
                                <div className={`status-text ${status}`}>
                                    {status === 'errors'
                                        ? 'Error Cases'
                                        : `${status} Cases`}
                                </div>
                                {Array.isArray(onBulkResponse[status]) && (
                                    <>
                                        {onBulkResponse[status]?.length
                                            ? onBulkResponse[status]?.join(', ')
                                            : 'None'}{' '}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
    }

    function renderRowItem() {
        if (type === 'Assign') {
            return (
                <>
                    <Form.Item
                        style={{ marginTop: 24 }}
                        label="Assign by name"
                        extra="Enter minimum 3 characters"
                    >
                        <AutoComplete
                            allowClear
                            onSearch={(value) =>
                                handleSearchUsers('name', value)
                            }
                            style={{ width: 280 }}
                            onSelect={(value, option) =>
                                handleChangeValue('name', value, option)
                            }
                            onChange={(value) => {
                                setCurrentValue({
                                    ...currentValue,
                                    name: value,
                                });
                            }}
                            value={currentValue?.name}
                            placeholder="Enter the first name or last name "
                            notFoundContent={errorText?.name}
                        >
                            {searchNameResults.map(({ name, attId }) => (
                                <Option key={name} value={attId}>
                                    {name} ({attId})
                                </Option>
                            ))}
                        </AutoComplete>
                    </Form.Item>
                    <Form.Item label="Assign by Id">
                        <AutoComplete
                            allowClear
                            onSearch={(value) =>
                                handleSearchUsers('attId', value)
                            }
                            style={{ width: 280 }}
                            value={currentValue?.attId}
                            onChange={(value) => {
                                setCurrentValue({
                                    ...currentValue,
                                    attId: value,
                                });
                            }}
                            notFoundContent={errorText?.id}
                            onSelect={(value, option) =>
                                handleChangeValue('attId', value, option)
                            }
                            placeholder="Enter the attId to search"
                        >
                            {searchIdResults.map(({ name, attId }) => (
                                <Option key={name} value={attId}>
                                    {name} ({attId})
                                </Option>
                            ))}
                        </AutoComplete>
                    </Form.Item>
                </>
            );
        } else if (type === 'Dispatch') {
            return (
                <div className="edit-row-item">
                    <div className="edit-row-title">Queue</div>
                    <div className="edit-row-data">
                        <Select
                            value={queue}
                            style={{
                                width: 200,
                            }}
                            placeholder="Assign Team"
                            filterOption={(inputValue, option) =>
                                option.value
                                    .toUpperCase()
                                    .indexOf(inputValue.toUpperCase()) !== -1
                            }
                            onChange={(value) => handleChangeQueue(value)}
                            showSearch
                            optionFilterProp="children"
                        >
                            {queueOptions?.map(({ value }) => (
                                <Option value={value}>{value}</Option>
                            ))}
                        </Select>
                    </div>
                </div>
            );
        }
    }
}
