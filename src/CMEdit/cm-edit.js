import React, { useState, useEffect } from 'react';
import { Tabs, Button, Space, Tooltip, Spin, Alert } from 'antd';
import {
    EditOutlined,
    ExpandAltOutlined,
    CloseOutlined,
} from '@ant-design/icons';

import { CaseDetail, EBBCaseDetail } from './CaseDetail';
import CaseTimeline from './CaseTimeline/case-timeline';
import diffDays from '../helpers/diffDays';
import './styles.css';

const RightTabActions = ({
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
}) => {
    /**
     *
     * @param {String} type
     * @returns Button with tooltip
     */
    const ButtonTooltip = ({ type, disabled, children, ...props }) => {
        return disabled ? (
            <Tooltip title={`No privileges to ${type}`} {...props}>
                {children}
            </Tooltip>
        ) : (
            children
        );
    };

    const owner =
        data?.caseHistory[0]?.assignedTo &&
        data?.caseHistory[0]?.assignedTo === attId;

    return (
        <div className="right-tab-actions d-flex flex-row align-items-center">
            <div
                className="severity-icon background-severity-high"
                style={{ width: 10, height: 10 }}
            />
            {data?.commitedSLA > 0 && (
                <div style={{ marginLeft: 10, marginRight: 28 }}>
                    SLA : Exceeded by{' '}
                    {Math.floor(
                        (new Date().getTime() -
                            new Date(data?.committedSLA).getTime()) /
                            1000 /
                            60 /
                            60 /
                            24
                    )}{' '}
                    days
                </div>
            )}
            <Space size={10} align="center">
                {data?.caseId.includes('C-') && (
                    <>
                        {onEdit && (
                            <ButtonTooltip type={'Edit'}>
                                <Button
                                    className="link-button"
                                    onClick={onEdit}
                                    disabled={disableEdit}
                                >
                                    <EditOutlined /> Edit Case
                                </Button>
                            </ButtonTooltip>
                        )}
                        {onClaim && !cmMode && (
                            <ButtonTooltip type={'Claim'}>
                                <Button
                                    className="link-button"
                                    onClick={() => onClaim()}
                                    disabled={
                                        !privileges.Edit ||
                                        disableButtons ||
                                        selectedRows.length > 1
                                    }
                                >
                                    Claim
                                </Button>
                            </ButtonTooltip>
                        )}
                        {onAssign && !cmMode && (
                            <ButtonTooltip type={'Assign'}>
                                <Button
                                    className="link-button"
                                    onClick={() => onAssign('Assign')}
                                    disabled={
                                        !privileges.Edit || disableButtons
                                    }
                                >
                                    Assign
                                </Button>
                            </ButtonTooltip>
                        )}
                        {onAssign && !cmMode && (
                            <ButtonTooltip type={'Dispatch'}>
                                <Button
                                    className="link-button"
                                    onClick={() => onAssign('Dispatch')}
                                    disabled={
                                        !privileges.Dispatch || disableButtons
                                    }
                                >
                                    Dispatch
                                </Button>
                            </ButtonTooltip>
                        )}
                    </>
                )}
                {/* {onLink && (
                    <Button className="link-button" onClick={onLink}>
                        <LinkOutlined /> Link Case
                    </Button>
                )}
                {onLaunch && (
                    <Button className="link-button" onClick={onLaunch}>
                        <BarChartOutlined /> Launch CRM
                    </Button>
                )} */}
                {onToggle && (
                    <ExpandAltOutlined
                        style={{ cursor: 'pointer' }}
                        onClick={onToggle}
                    />
                )}
                {onCloseEdit && (
                    <CloseOutlined
                        title="Close"
                        style={{ cursor: 'pointer' }}
                        onClick={onCloseEdit}
                    />
                )}
            </Space>
        </div>
    );
};

export default function CMEdit({
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
}) {
    // Disable the fields and buttons based on the State and re open duration
    const disableFields =
        (editDisabledStates.includes(data?.caseHistory[0]?.state) &&
            data?.caseHistory[0]?.updatedAt &&
            diffDays(data?.caseHistory[0]?.updatedAt) < reOpenStateDuration) ||
        (!privileges.Edit && privileges.Close);
    const disableButtons = editDisabledStates.includes(
        data?.caseHistory[0]?.state
    );

    const disableAllFieldsExceptNotes =
        data?.caseHistory[0]?.assignedTo !== attId || cmMode;
    const handleUpdate = (value) => {
        onUpdate?.(value);
    };

    useEffect(() => {
        if (data?.caseId !== selectedData?.caseId) {
            setCurrentCase(null);
            postCasesSearch(
                { caseId: selectedData?.caseId },
                selectedData?.billingAccountNumber
            );
            setRecentActivity(
                selectedData?.caseId,
                selectedData?.billingAccountNumber
            );
        }
    }, [selectedData]);

    const
        handleCloseEdit = () => {
            if (!showTable) {
                onToggle();
            }
            onCloseEdit();
        },
        items = [
            {
                label: 'Case Detail',
                key: 'detail',
                children: data?.sacCode ? (
                    <EBBCaseDetail
                        data={data}
                        loading={customerInfoLoading}
                        customerInfo={customerInfo}
                        customerInfoError={customerInfoError}
                        prevValue={prevValue}
                        error={error}
                        isEdit={edit}
                        onUpdate={(value) => handleUpdate(value)}
                        onCancel={() => onCancelEdit()}
                        metadata={metadata}
                        privileges={privileges}
                        disableFields={disableFields}
                        disableAllFieldsExceptNotes={
                            disableAllFieldsExceptNotes
                        }
                        attId={attId}
                        onEditValuesChange={(value) =>
                            onEditValuesChange(value)
                        }
                        cmMode={cmMode}
                        accountStatuses={accountStatuses}
                        bridgePayStatuses={bridgePayStatuses}
                        caseUpdateLoading={caseUpdateLoading}
                        caseCategoriesConfig={caseCategoriesConfig}
                    />
                ) : (
                    <CaseDetail
                        data={data}
                        loading={customerInfoLoading}
                        customerInfo={customerInfo}
                        customerInfoError={customerInfoError}
                        prevValue={prevValue}
                        error={error}
                        isEdit={edit}
                        onUpdate={(value) => handleUpdate(value)}
                        onCancel={() => onCancelEdit()}
                        metadata={metadata}
                        privileges={privileges}
                        disableFields={disableFields}
                        disableAllFieldsExceptNotes={
                            disableAllFieldsExceptNotes
                        }
                        attId={attId}
                        onEditValuesChange={(value) =>
                            onEditValuesChange(value)
                        }
                        cmMode={cmMode}
                        accountStatuses={accountStatuses}
                        bridgePayStatuses={bridgePayStatuses}
                        caseUpdateLoading={caseUpdateLoading}
                        caseCategoriesConfig={caseCategoriesConfig}
                    />
                )
            },
            {
                label: 'Case Timeline',
                key: 'timeline',
                children: <CaseTimeline data={data} caseHistory={data?.caseHistory} caseError={caseError} showTable={showTable} />
            }
        ]




    return caseLoading ? (
        <div className="case-loading">
            <Spin tip="Loading..." />
        </div>
    ) : caseError && !data?.caseId ? (
        <div className="case-error">
            <Alert
                type="error"
                className="alert-error"
                message={caseError || 'Error loading the case'}
                closable
                onClose={() => handleCloseEdit()}
            />
            <CloseOutlined
                title="Close"
                style={{ cursor: 'pointer' }}
                onClick={onCloseEdit}
            />
        </div>
    ) : data?.caseId ? (
        <div className="cm-edit-wrapper" key={data?.caseId}>
            <Tabs
                defaultActiveKey="detail"
                activeKey={tabKey}
                onChange={(key) => onTabChange(key)}
                tabBarExtraContent={{
                    right: (
                        <RightTabActions
                            data={data}
                            onEdit={
                                edit
                                    ? null
                                    : () => {
                                          setEdit(true);
                                          onTabChange('detail');
                                      }
                            }
                            onLink={onLink}
                            onAssign={(type) => onAssign(type, data)}
                            onLaunch={() => {}}
                            onCloseEdit={() => handleCloseEdit()}
                            onClaim={() => onClaim(data)}
                            onToggle={onToggle}
                            privileges={privileges}
                            disableButtons={disableButtons}
                            disableEdit={
                                disableFields
                                    ? false
                                    : disableButtons
                                    ? true
                                    : false
                            }
                            attId={attId}
                            cmMode={cmMode}
                            selectedRows={selectedRows}
                        />
                    ),
                }}
                items = {items}
            >
                 
            </Tabs>
        </div>
    ) : (
        <> Error loading the case</>
    );
}
