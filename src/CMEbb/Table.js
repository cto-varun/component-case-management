import React, { useState } from 'react';
import { Table, Form, Input, Typography, Popconfirm } from 'antd';
import './styles.css';
import { EBBFilters } from './constants';

const originData = [
    {
        sac: '8EBBHJSUY900',
        enrollmentDate: '02/35/2993',
        enrollmentCode: '2323523555',
        subscriberId: 'ETET35635',
        ctn: '353535666',
        serviceType: 'Voice',
        city: 'Hatilo',
        state: 'PR',
        status: 'NEW'
    }
];

export default function EBBTable() {

    const [form] = Form.useForm();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [data, setData] = useState(originData);

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        fixed: true
    };

    function onSelectChange(selectedRowKeys, selectedRows) {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedRows(selectedRows);
    }

    function EditableCell({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) {
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                        rules={[
                            {
                                required: true,
                                message: `Please Input ${title}!`,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    }

    const isEditing = (record) => record.key === editingKey;

    const columns = [
        {
            title: 'SAC CODE',
            dataIndex: 'sac',
            fixed: 'left',
            width: 150,
            className: 'ebbTableHeader',
        },
        {
            title: 'ENROLLMENT DATE',
            dataIndex: 'enrollmentDate',
            className: 'ebbTableHeader',
        },
        {
            title: 'ENROLLMENT CODE',
            dataIndex: 'enrollmentCode',
            className: 'ebbTableHeader',
        },
        {
            title: 'SUBSCRIBRER ID',
            dataIndex: 'subscriberId',
            className: 'ebbTableHeader',
        },
        {
            title: 'PHONE NUMBER',
            dataIndex: 'ctn',
            className: 'ebbTableHeader',
        },
        {
            title: 'SERVICE TYPE',
            dataIndex: 'serviceType',
            className: 'ebbTableHeader',
        },
        {
            title: 'CITY',
            dataIndex: 'city',
            className: 'ebbTableHeader',
        },
        {
            title: 'STATE',
            dataIndex: 'state',
            className: 'ebbTableHeader',
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            className: 'ebbTableHeader',
            editable: true
        },
        {
            title: 'ACTIONS',
            dataIndex: 'action',
            fixed: 'right',
            className: 'ebbTableHeader',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <a href="#!" onClick={() => { save() }} style={{ marginRight: 8 }}>
                            Save
                      </a>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <a>Cancel</a>
                        </Popconfirm>
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        Update
                    </Typography.Link>
                );

            }
        }
    ];

    function edit(record) {
        form.setFieldsValue({ ...record });
        setEditingKey(record.key);
    }

    function cancel() {
        setEditingKey('');
    }
    async function save(key) {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);

            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    }

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    let ebbCSVHeaders = columns.slice();
    ebbCSVHeaders.splice(columns.findIndex(e => e.dataIndex === 'actions'), 1)

    return (
        <div className="ebb-table-wrapper">
            <EBBFilters
                selectedRows={selectedRows}
                ebbCSVHeaders={ebbCSVHeaders}
            />

            <Form form={form} component={false}>
                <Table
                    columns={mergedColumns}
                    rowKey="sac"
                    dataSource={data}
                    pagination={{
                        position: 'bottom',
                    }}
                    bordered
                    className="cm-table mt-2"
                    rowSelection={rowSelection}
                    rowClassName="ebbTableHeader"
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    scroll={{
                        x: '100vw'
                    }}
                />
            </Form>
        </div>
    )
}