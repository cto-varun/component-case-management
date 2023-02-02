import React from 'react';
import { Space, Spin, Button, Tooltip, Typography } from 'antd';
import moment from 'moment';

const { Paragraph } = Typography;
const strings = {
    nA: 'N/A',
    ebbEmergencyBroadband: 'EBB Emergency Broadband',
    searchCustomer: 'searchCustomer',
    custAuth: 'custAuth',
    ebbProgram: 'ebbProgram'
};

const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;
const getAdditionalProperties = (data) => data?.caseHistory[0]?.additionalProperties;
const getNameProperties = (data) => data?.name;

function isEBBFn(data, ban) {
    return ban === strings.nA &&
        data?.caseHistory[0]?.category === strings.ebbEmergencyBroadband;
}

function getAccountFullName(data, customerInfo) {
    const additionalProperties = getAdditionalProperties(data);
    return additionalProperties?.firstName
        ? getFullName(additionalProperties.firstName, additionalProperties.lastName)
        : getFullName(getNameProperties(customerInfo)?.firstName, getNameProperties(customerInfo)?.lastName);
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
        state: additionalProperties?.state || customerInfo?.billingAddress?.state,
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

export default function CustomerDetailBar({
    data,
    customerInfo,
    loading,
    customerInfoError,
    cmMode,
    accountStatuses,
    bridgePayStatuses,
}) {
    const ban = data?.billingAccountNumber;
    const ebb = isEBBFn(data, ban);

    return (
        <>
            <Space size={24} className="meta-data">
                <Paragraph
                    style={{ display: 'flex' }}
                    copyable={{ text: data.caseId }}
                >
                    <div className="id-wrapper">{data.caseId}</div>
                </Paragraph>
                <Space size={20}>
                    <>
                        {data?.phoneNumber && (
                            <Paragraph
                                style={{ display: 'flex' }}
                                copyable={{ text: data.phoneNumber }}
                            >
                                <div>CTN : {data.phoneNumber}</div>
                            </Paragraph>
                        )}
                        {((ban && ban !== 'N/A') || ebb) && (
                            <Paragraph
                                style={{ display: 'flex' }}
                                copyable={{ text: ban }}
                            >
                                {!ebb &&
                                (ban?.includes('C') || (ban && isNaN(ban))) ? (
                                    <div>BAN : {ban}</div>
                                ) : (
                                    <Tooltip
                                        title={
                                            ebb
                                                ? 'Open EBB form in new tab'
                                                : 'Manage account in new tab'
                                        }
                                    >
                                        <Button
                                            type="link"
                                            onClick={() => handleClick(data, customerInfo, ebb)}
                                        >
                                            {ban && ban !== 'N/A'
                                                ? `BAN : ${ban}`
                                                : ebb
                                                ? 'Go to EBB'
                                                : ''}
                                        </Button>
                                    </Tooltip>
                                )}
                            </Paragraph>
                        )}
                    </>
                    <div>
                        Created on : {new Date(data.createdAt).toLocaleString()}
                    </div>
                    <div>
                        Last Updated on :{' '}
                        {data.caseHistory[0]?.updatedAt
                            ? new Date(
                                  data.caseHistory[0]?.updatedAt
                              ).toLocaleString()
                            : 'N/A'}
                    </div>
                    {data?.caseHistory[0]?.estimatedResolutionTime && (
                        <div>
                            Estimated Completion :{' '}
                            {new Date(
                                data.caseHistory[0]?.estimatedResolutionTime
                            ).toLocaleString()}
                        </div>
                    )}
                    <div>
                        Updated By :{' '}
                        {data?.caseHistory[0]?.updatedBy ||
                            data?.createdBy ||
                            'N/A'}
                    </div>
                    <div>
                        Assigned To :{' '}
                        {data.caseHistory[0]?.assignedTo
                            ? data.caseHistory[0]?.assignedTo
                            : ''}
                    </div>
                </Space>
            </Space>
            {!cmMode && (
                <>
                    {loading ? (
                        <div className="case-loading">
                            <Spin />
                        </div>
                    ) : customerInfoError ? (
                        <div style={{ color: 'red', margin: 12 }}>
                            {customerInfoError}
                        </div>
                    ) : (
                        customerInfo && (
                            <Space size={30} className="meta-data">
                                <Space size={52}>
                                    <div>
                                        Name : {customerInfo?.name?.firstName}{' '}
                                        {customerInfo?.name?.lastName}
                                    </div>
                                    <div>
                                        Account Status :{' '}
                                        {customerInfo?.accountDetails?.banStatus
                                            ? accountStatuses[
                                                  customerInfo?.accountDetails
                                                      ?.banStatus
                                              ]
                                            : 'N/A'}
                                    </div>
                                    <div>
                                        AR Balance : $
                                        {
                                        customerInfo?.accountDetails?.arBalance !== undefined && customerInfo?.accountDetails?.arBalance !== '' && customerInfo?.accountDetails?.arBalance !== null
                                            ? customerInfo?.accountDetails?.arBalance
                                            : 'N/A'}
                                    </div>
                                    <div>
                                        Due by :{' '}
                                        {customerInfo?.accountDetails
                                            ?.billCycleDate
                                            ? moment(
                                                  customerInfo?.accountDetails
                                                      ?.billCycleDate
                                              )
                                                  .subtract(1, 'days')
                                                  .format('MM/DD/YYYY')
                                            : 'N/A'}
                                    </div>
                                    <div>
                                        Bill Cycle Date :{' '}
                                        {customerInfo?.accountDetails
                                            ?.billCycleDate
                                            ? moment(
                                                  customerInfo?.accountDetails
                                                      ?.billCycleDate
                                              ).format('MM/DD/YYYY')
                                            : 'N/A'}
                                    </div>
                                    <div>
                                        Bridge Pay Status :{' '}
                                        {customerInfo?.bridgePayDetails
                                            ?.bridgePayList?.length > 0
                                            ? bridgePayStatuses[
                                                  customerInfo?.bridgePayDetails
                                                      ?.bridgePayList[0]?.status
                                              ]
                                            : 'None'}
                                    </div>
                                </Space>
                            </Space>
                        )
                    )}
                </>
            )}
        </>
    );
}
