import React from 'react';
import { Input, Table, Modal, Radio, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import './styles.css';

export default function CMLinkDialog({ visible, onCancel, suggestions }) {
    const getColumns = () => [
        {
            title: 'CTN',
            dataIndex: 'phoneNumber',
            sorter: (a, b) => a.phoneNumber - b.phoneNumber,
        },
        {
            title: 'BAN',
            dataIndex: 'billingAccountNumber,',
            sorter: (a, b) => a.billingAccountNumber - b.billingAccountNumber,
        },
        {
            title: 'CREATED',
            dataIndex: 'createdAt',
            sorter: (a, b) => a.createdAt - b.createdAt,
            render: (value) => {
                return new Date(value).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: 'numeric',
                    hourCycle: 'h12',
                });
            },
        },
        {
            title: 'CATEGORY',
            dataIndex: 'category',
            sorter: (a, b) => a.category - b.category,
        },
        {
            title: 'SUBCATEGORY1',
            dataIndex: 'subCategory1',
            sorter: (a, b) => a.subCategory1 - b.subCategory1,
        },
        {
            title: 'SUBCATEGORY2',
            dataIndex: 'subCategory2',
            sorter: (a, b) => a.subCategory2 - b.subCategory2,
        },
    ];

    const caseHistory = (data) => {
        return data && data.caseHistory && data.caseHistory[0];
    };

    const columnData = suggestions?.map((caseData) => {
        let value = {
            ...caseData,
            category: caseHistory(caseData)?.category,
            subCategory1: caseHistory(caseData)?.subCategory1,
            subCategory2: caseHistory(caseData)?.subCategory2,
        };
        return value;
    });

    return (
        <Modal
            className="cm-link-case-modal"
            title={
                <div className="d-flex flex-column">
                    <div className="cm-link-case-header">Link Case To</div>
                    <div className="search-box-wrapper d-flex flex-row align-items-center">
                        <Radio.Group
                            options={['Existing Case', 'Interaction']}
                            onChange={() => {}}
                            defaultValue="Existing Case"
                        />
                        <Input
                            placeholder="Search BAN or customer CTN "
                            suffix={
                                <SearchOutlined
                                    style={{ color: 'rgba(0, 0, 0, 0.45)' }}
                                />
                            }
                            className="search-box"
                        />
                    </div>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={900}
        >
            <div className="suggest-table">
                <div>Smart Suggest</div>
                <Table
                    className="cm-suggest-table"
                    columns={getColumns()}
                    dataSource={columnData}
                    rowSelection={{ columnWidth: 32 }}
                    size="middle"
                    rowKey="id"
                    showHeader={false}
                    pagination={false}
                />
            </div>
            <div className="d-flex flex-row align-items-center justify-content-between action-buttons">
                <Button className="cancel-button" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
}
