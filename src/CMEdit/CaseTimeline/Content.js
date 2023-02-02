import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
import moment from 'moment';

export default function Content({ index, data, caseHistory }) {
    const { Title, Text } = Typography;

    let additionalPropertiesArray = [];
    caseHistory[index]?.additionalProperties &&
        Object.entries(caseHistory[index]?.additionalProperties)?.forEach(
            ([key, value]) => {
                additionalPropertiesArray.push({ key: key, value: value });
            }
        );

    const getFieldValue = (value) => (value ? value : 'N/A');

    return (
        <div style={{ padding: '1% 0%' }}>
            <Row>
                <Col span={8} className="form-view-background">
                    <Title level={5}>{caseHistory[index]?.status}</Title>

                    <Space direction="vertical">
                        <Text className="d-flex">
                            <div className="mw-140">Creation Date : </div>
                            <Text>
                                {getFieldValue(data.createdAt) === 'N/A'
                                    ? 'N/A'
                                    : moment(data.createdAt).format(
                                          'DD MMM YYYY, h:mm a'
                                      )}
                            </Text>
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Updated By : </div>
                            <Text>
                                {getFieldValue(
                                    caseHistory[index]?.updatedBy ||
                                        data.createdBy
                                )}
                            </Text>
                        </Text>
                        {caseHistory[index]?.state === 'Closed' &&
                            caseHistory[index]?.resolution && (
                                <Text className="d-flex">
                                    <div className="mw-140">Resolution: : </div>
                                    {getFieldValue(
                                        caseHistory[index]?.resolution
                                    )}
                                </Text>
                            )}
                        <Text className="d-flex">
                            <div className="mw-140">Assigned To : </div>
                            {caseHistory[index]?.assignedTo || data.createdBy}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Case Condition : </div>
                            {getFieldValue(caseHistory[index]?.state)}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Case ID : </div>
                            {getFieldValue(data.caseId)}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Category : </div>
                            {getFieldValue(caseHistory[index]?.category)}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Subcategory 1 : </div>
                            {getFieldValue(caseHistory[index]?.subCategory1)}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Subcategory 2 : </div>
                            {getFieldValue(caseHistory[index]?.subCategory2)}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Priority : </div>
                            {getFieldValue(caseHistory[index]?.priority)}
                        </Text>
                        <Text className="d-flex">
                            <div className="mw-140">Queue : </div>
                            {getFieldValue(caseHistory[index]?.assignedTeam)}
                        </Text>
                        {additionalPropertiesArray?.map(({ key, value }) => (
                            <Text className="d-flex">
                                <div className="mw-140">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}{' '}
                                    :{' '}
                                </div>
                                {getFieldValue(value)}
                            </Text>
                        ))}
                    </Space>
                </Col>

                <Col span={15} offset={1} className="form-view-background">
                    <Title level={5}>Notes</Title>
                    <Text className="detail-txt">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: getFieldValue(
                                    caseHistory[index]?.summary ||
                                        data?.description
                                ),
                            }}
                        />
                    </Text>
                </Col>
            </Row>
        </div>
    );
}
