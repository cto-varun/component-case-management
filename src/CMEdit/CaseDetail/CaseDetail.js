import React, { useState } from 'react';
import Notes from '@ivoyant/component-notes';
import {
    Space,
    Tag,
    Button,
    Card,
    Select,
    Alert,
    DatePicker,
    Form,
    Row,
    Col,
    Checkbox,
    Input,
} from 'antd';

import RowItem from './RowItem';
import CustomerDetailBar from '../CustomerDetailBar';
import moment from 'moment';
import stateList from './stateList';
import shortid from 'shortid';

export default function CaseDetail({
    data,
    error,
    isEdit,
    onUpdate,
    onCancel,
    metadata,
    privileges,
    disableFields,
    disableAllFieldsExceptNotes,
    attId,
    prevValue,
    onEditValuesChange,
    customerInfo,
    loading,
    customerInfoError,
    cmMode,
    accountStatuses,
    bridgePayStatuses,
    caseUpdateLoading,
    caseCategoriesConfig,
}) {
    const [form] = Form.useForm();
    const intialData = {
        caseId: data?.caseId,
        updatedBy: attId,
        summary: '',
        status: data?.caseHistory[0]?.status,
        state: data?.caseHistory[0]?.state,
        category: data.category || data?.caseHistory[0]?.category,
        priority: data?.caseHistory[0]?.priority,
        subCategory1: data?.subCategory1 || data?.caseHistory[0]?.subCategory1,
        subCategory2: data?.subCategory2 || data?.caseHistory[0]?.subCategory2,
        estimatedResolutionTime: data?.caseHistory[0]?.estimatedResolutionTime,
        additionalProperties: data?.caseHistory[0]?.additionalProperties || {},
        resolution: null,
    };
    const formData =
        data?.caseId === prevValue?.caseEditValues?.caseId
            ? prevValue?.caseEditValues
            : intialData;
    const [values, setValues] = useState(formData);

    const getOptions = (domain) => {
        const options = metadata
            ?.find((item) => item.domain === domain)
            ?.metadata?.categories?.map((category) => {
                return { value: category?.name, label: category?.name };
            });
        return options;
    };

    const getCategoryOptions = (categoryMetadata) => {
        const options = categoryMetadata?.map((category) => {
            return { value: category?.name, label: category?.name };
        });
        return options;
    };

    const categoryOptions = getOptions('cases');
    const casesMetaData = metadata?.find((item) => item.domain === 'cases')
        ?.metadata?.categories;

    const subCategory1MetaData = casesMetaData?.find(
        (item) => item.name === values.category
    )?.categories;
    const subCategory1Options = getCategoryOptions(subCategory1MetaData);

    const subCategory2MetaData = subCategory1MetaData?.find(
        (item) => item.name === values.subCategory1
    )?.categories;
    const subCategory2Options = getCategoryOptions(subCategory2MetaData);

    const statusOptions = getOptions('caseStatuses');
    const priorityOptions = getOptions('casePriorities');

    // Account metadata
    const accountMetaData = metadata?.find((item) => item.domain === 'account')
        ?.metadata?.categories;
    const accountTypeMetadata = accountMetaData?.find(
        (item) => item.name === 'accountType'
    )?.categories;
    const accountSubTypeMetadata = accountMetaData?.find(
        (item) => item.name === 'accountSubType'
    )?.categories;

    const resolutionCodes = getOptions('caseResolutionCodes');

    // Return the state options by privileges
    const caseStateFilter = (value) => {
        let bool = true;
        if (
            (value === 'Resolved' && !privileges.Resolve) ||
            (value === 'Closed' && !privileges.Close)
        ) {
            bool = false;
        }
        if (
            (!privileges.Edit && privileges.Close) ||
            (!privileges.Edit && privileges.Resolve)
        ) {
            if (value === 'Rejected') {
                bool = false;
            }
        }
        return bool;
    };

    const caseStateOptions = getOptions('caseStates').filter(({ value }) =>
        caseStateFilter(value)
    );

    const handleUpdate = () => {
        if (JSON.stringify(intialData) !== JSON.stringify(values)) {
            if (!values?.resolution) {
                delete values.resolution;
            }
            if (values?.estimatedResolutionTime) {
                values.estimatedResolutionTime = getDateFormat(
                    values.estimatedResolutionTime
                );
            }
            if (data?.caseHistory[0]?.assignedTo) {
                values.assignedTo = data?.caseHistory[0]?.assignedTo;
            }
            if (!values.summary && data?.caseHistory[0]?.summary) {
                values.summary = data?.caseHistory[0]?.summary;
            }
            if (data?.caseHistory[0]?.assignedTeam) {
                values.assignedTeam = data?.caseHistory[0]?.assignedTeam;
            }
            if (
                data?.caseHistory[0]?.state === 'NEW' &&
                values.state === 'NEW'
            ) {
                values.state = 'Open';
            }
            onUpdate && onUpdate(values);
        }
    };

    const handleChange = (name, value) => {
        if (value === 'Closed' && (name === 'state' || name === 'status')) {
            setValues({ ...values, state: value, status: value });
            form.setFieldsValue({ state: value, status: value });
            onEditValuesChange({ ...values, state: value, status: value });
        } else {
            setValues({ ...values, [name]: value });
            onEditValuesChange({ ...values, [name]: value });
        }
    };

    const getDateFormat = (value) => {
        let convertDate = new Date(value)
            ?.toISOString()
            ?.replace('T', ' ')
            .split('.')[0];
        let date = `${convertDate}+0000`;
        return date;
    };

    const handleDateChange = (name, value) => {
        const date = value && getDateFormat(value);
        date && handleChange(name, date);
    };

    const getAccountsType = (data, name) => {
        return data?.find((item) => item.name === name)?.description;
    };

    const interactionIds = data?.interactions?.map(
        ({ interactionId }) => interactionId
    );

    const handleChangeAdditionalProps = (value, key, type) => {
        if (type === 'DatePicker') {
            value = moment().format('YYYY-MM-DD HH:mm:ssZZ');
        }
        setValues({
            ...values,
            additionalProperties: {
                ...values?.additionalProperties,
                [key]: value,
            },
        });
    };

    let additionalPropertiesArray = [];
    data?.caseHistory[0]?.additionalProperties &&
        Object.entries(data?.caseHistory[0]?.additionalProperties)?.forEach(
            ([key, value]) => {
                additionalPropertiesArray.push({ key: key, value: value });
            }
        );

    return (
        <div className="case-detail-data" key={data.caseId}>
            <CustomerDetailBar
                data={data}
                customerInfo={customerInfo}
                loading={loading}
                customerInfoError={customerInfoError}
                cmMode={cmMode}
                accountStatuses={accountStatuses}
                bridgePayStatuses={bridgePayStatuses}
            />
            <div style={{ marginTop: 16 }}>
                {isEdit ? (
                    <Space
                        size={24}
                        direction="vertical"
                        style={{ width: '100%' }}
                    >
                        <Form
                            name="case-update"
                            form={form}
                            initialValues={formData}
                            onFinish={handleUpdate}
                            layout="vertical"
                        >
                            <Card className="edit-wrapper">
                                <Space
                                    size={30}
                                    className="edit-boxes-wrapper"
                                    style={{ width: '100%', flexWrap: 'wrap' }}
                                >
                                    <Form.Item label="Category" name="category">
                                        <Select
                                            value={values.category}
                                            style={{
                                                width: 310,
                                            }}
                                            onChange={(value) =>
                                                handleChange('category', value)
                                            }
                                            placeholder="Category"
                                            disabled={
                                                disableFields ||
                                                disableAllFieldsExceptNotes
                                            }
                                        >
                                            {categoryOptions?.map((item) => (
                                                <Select.Option
                                                    value={item.value}
                                                    key={item.value}
                                                >
                                                    {item.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="Sub Category 1"
                                        name="subCategory1"
                                    >
                                        <Select
                                            value={values.subCategory1}
                                            style={{
                                                width: 310,
                                            }}
                                            onChange={(value) =>
                                                handleChange(
                                                    'subCategory1',
                                                    value
                                                )
                                            }
                                            placeholder="SubCategory1"
                                            disabled={!subCategory1MetaData}
                                            disabled={
                                                disableFields ||
                                                disableAllFieldsExceptNotes
                                            }
                                        >
                                            {subCategory1Options?.map(
                                                (item) => (
                                                    <Select.Option
                                                        value={item.value}
                                                        key={item.value}
                                                    >
                                                        {item.label}
                                                    </Select.Option>
                                                )
                                            )}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="Sub Category 2"
                                        name="subCategory2"
                                    >
                                        <Select
                                            value={values.subCategory2}
                                            style={{
                                                width: 310,
                                            }}
                                            onChange={(value) =>
                                                handleChange(
                                                    'subCategory2',
                                                    value
                                                )
                                            }
                                            placeholder="SubCategory2"
                                            disabled={
                                                disableFields ||
                                                disableAllFieldsExceptNotes
                                            }
                                        >
                                            {subCategory2Options?.map(
                                                (item) => (
                                                    <Select.Option
                                                        value={item.value}
                                                        key={item.value}
                                                    >
                                                        {item.label}
                                                    </Select.Option>
                                                )
                                            )}
                                        </Select>
                                    </Form.Item>
                                    <div class="ant-space-item">
                                        <div class="ant-row ant-form-item">
                                            <div class="ant-col ant-form-item-label">
                                                <label
                                                    for="case-update_ETR"
                                                    class=""
                                                    title="ETR"
                                                >
                                                    Estimated Resolution Time
                                                </label>
                                            </div>
                                            <DatePicker
                                                placeholder="ETR"
                                                defaultValue={
                                                    values?.estimatedResolutionTime
                                                        ? moment(
                                                              new Date(
                                                                  values?.estimatedResolutionTime
                                                              )
                                                          )
                                                        : ''
                                                }
                                                onChange={(date) =>
                                                    handleDateChange(
                                                        'estimatedResolutionTime',
                                                        date
                                                    )
                                                }
                                                format={'DD MMM YYYY'}
                                                style={{
                                                    width: 220,
                                                }}
                                                disabled={
                                                    disableFields ||
                                                    disableAllFieldsExceptNotes
                                                }
                                            />
                                        </div>
                                    </div>
                                    <Form.Item label="Status" name="status">
                                        <Select
                                            value={values.status}
                                            placeholder="Status"
                                            style={{
                                                width: 310,
                                            }}
                                            onChange={(value) =>
                                                handleChange('status', value)
                                            }
                                            disabled={
                                                disableFields ||
                                                disableAllFieldsExceptNotes
                                            }
                                        >
                                            {statusOptions?.map((item) => (
                                                <Select.Option
                                                    value={item.value}
                                                    key={item.value}
                                                >
                                                    {item.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Priority" name="priority">
                                        <Select
                                            value={values.priority}
                                            placeholder="Priority"
                                            style={{
                                                width: 170,
                                            }}
                                            onChange={(value) =>
                                                handleChange('priority', value)
                                            }
                                            disabled={
                                                disableFields ||
                                                disableAllFieldsExceptNotes
                                            }
                                        >
                                            {priorityOptions?.map((item) => (
                                                <Select.Option
                                                    value={item.value}
                                                    key={item.value}
                                                >
                                                    {item.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="Case Condition"
                                        name="state"
                                    >
                                        <Select
                                            value={values.state}
                                            placeholder="Case Condition"
                                            style={{ width: 200 }}
                                            onChange={(value) =>
                                                handleChange('state', value)
                                            }
                                            disabled={
                                                disableAllFieldsExceptNotes
                                            }
                                        >
                                            {caseStateOptions?.map((item) => (
                                                <Select.Option
                                                    value={item.value}
                                                    key={item.value}
                                                >
                                                    {item.label}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    {data?.caseHistory[0]?.state !== 'Closed' &&
                                        (values.state === 'Closed' ||
                                            values.status === 'Closed') && (
                                            <Form.Item
                                                label="Resolution Code"
                                                name="resolution"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Please select the resolution code!',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    value={values.resolution}
                                                    placeholder="Select Resolution Code"
                                                    style={{ width: 444 }}
                                                    onChange={(value) =>
                                                        handleChange(
                                                            'resolution',
                                                            value
                                                        )
                                                    }
                                                    disabled={
                                                        disableAllFieldsExceptNotes
                                                    }
                                                >
                                                    {resolutionCodes?.map(
                                                        ({ value, label }) => (
                                                            <Select.Option
                                                                value={value}
                                                                key={value}
                                                            >
                                                                {label}
                                                            </Select.Option>
                                                        )
                                                    )}
                                                </Select>
                                            </Form.Item>
                                        )}
                                </Space>
                                <Space
                                    size={30}
                                    className="edit-boxes-wrapper"
                                    style={{ width: '100%', flexWrap: 'wrap' }}
                                >
                                    {values?.category &&
                                        caseCategoriesConfig[
                                            values?.category
                                        ]?.map(
                                            ({
                                                type,
                                                label,
                                                name,
                                                options,
                                                ...props
                                            }) => {
                                                switch (type) {
                                                    case 'Input':
                                                        return (
                                                            <Form.Item
                                                                label={label}
                                                                key={shortid.generate()}
                                                            >
                                                                <Input
                                                                    style={{
                                                                        width: 220,
                                                                        marginTop: 8,
                                                                        marginRight: 8,
                                                                    }}
                                                                    value={
                                                                        values
                                                                            ?.additionalProperties[
                                                                            name
                                                                        ]
                                                                    }
                                                                    name={name}
                                                                    label={
                                                                        label
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                            name
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disableFields ||
                                                                        disableAllFieldsExceptNotes
                                                                    }
                                                                    // {...props}
                                                                />
                                                            </Form.Item>
                                                        );
                                                    case 'DatePicker':
                                                        return (
                                                            <Form.Item
                                                                label={label}
                                                                key={shortid.generate()}
                                                            >
                                                                <DatePicker
                                                                    placeholder={
                                                                        label
                                                                    }
                                                                    defaultValue={
                                                                        values
                                                                            ?.additionalProperties[
                                                                            name
                                                                        ]
                                                                            ? moment(
                                                                                  new Date(
                                                                                      values?.additionalProperties[
                                                                                          name
                                                                                      ]
                                                                                  )
                                                                              )
                                                                            : ''
                                                                    }
                                                                    onChange={(
                                                                        date
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            date,
                                                                            name,
                                                                            type
                                                                        )
                                                                    }
                                                                    format="YYYY-MM-DD h:mm A"
                                                                    use12Hours
                                                                    showTime
                                                                    style={{
                                                                        width: 220,
                                                                        marginTop: 8,
                                                                        marginRight: 8,
                                                                    }}
                                                                    disabled={
                                                                        disableFields ||
                                                                        disableAllFieldsExceptNotes
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        );
                                                    case 'Select':
                                                        const newOptions =
                                                            name === 'state'
                                                                ? stateList
                                                                : options;
                                                        return (
                                                            <Form.Item
                                                                label={label}
                                                                style={{
                                                                    width: 220,
                                                                    marginTop: 8,
                                                                    marginRight: 8,
                                                                }}
                                                                key={shortid.generate()}
                                                            >
                                                                <Select
                                                                    value={
                                                                        values
                                                                            ?.additionalProperties[
                                                                            name
                                                                        ]
                                                                    }
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    onChange={(
                                                                        value
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            value,
                                                                            name
                                                                        )
                                                                    }
                                                                    filterOption={(
                                                                        input,
                                                                        option
                                                                    ) =>
                                                                        option.children
                                                                            .toLowerCase()
                                                                            .indexOf(
                                                                                input.toLowerCase()
                                                                            ) >=
                                                                        0
                                                                    }
                                                                    disabled={
                                                                        disableFields ||
                                                                        disableAllFieldsExceptNotes
                                                                    }
                                                                >
                                                                    {newOptions.map(
                                                                        (
                                                                            option,
                                                                            index
                                                                        ) => (
                                                                            <Select.Option
                                                                                value={
                                                                                    option.value
                                                                                }
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </Select.Option>
                                                                        )
                                                                    )}
                                                                </Select>
                                                            </Form.Item>
                                                        );
                                                    case 'CheckBox':
                                                        return (
                                                            <Form.Item
                                                                key={shortid.generate()}
                                                                style={{
                                                                    width: 220,
                                                                    marginTop: 36,
                                                                    marginRight: 8,
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={
                                                                        values
                                                                            ?.additionalProperties[
                                                                            name
                                                                        ] ===
                                                                        'true'
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleChangeAdditionalProps(
                                                                            e
                                                                                .target
                                                                                .checked
                                                                                ? 'true'
                                                                                : 'false',
                                                                            name
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disableFields ||
                                                                        disableAllFieldsExceptNotes
                                                                    }
                                                                >
                                                                    {label}
                                                                </Checkbox>
                                                            </Form.Item>
                                                        );
                                                    default:
                                                        return <></>;
                                                }
                                            }
                                        )}
                                </Space>
                                <div className="edit-row-item">
                                    <Form.Item label="Notes" name="summary">
                                        <Notes
                                            style={{
                                                height: 130,
                                                marginBottom: 48,
                                                width: 'calc(100% - 300px)',
                                            }}
                                            theme="snow"
                                            value={values.summary || ''}
                                            onChange={(value) =>
                                                handleChange('summary', value)
                                            }
                                        />
                                    </Form.Item>
                                </div>
                                {error && (
                                    <Alert message={error} type="error" />
                                )}
                            </Card>
                            <Space size={10}>
                                <Button
                                    className="submit-button"
                                    htmlType="submit"
                                    disabled={
                                        JSON.stringify(intialData) ===
                                        JSON.stringify(values)
                                    }
                                    loading={caseUpdateLoading}
                                >
                                    Update
                                </Button>
                                <Button
                                    className="cancel-button"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Form>
                    </Space>
                ) : (
                    <div className="view-wrapper d-flex flex-row">
                        <div className="d-flex flex-column">
                            <Space
                                className="d-flex align-items-center category-tags"
                                size={6}
                            >
                                {values.category && (
                                    <Tag color="#E4F5DE">{values.category}</Tag>
                                )}
                                {values.subCategory1 && (
                                    <Tag color="#D6E4FF">
                                        {values.subCategory1}
                                    </Tag>
                                )}
                                {values.subCategory2 && (
                                    <Tag color="#D6E4FF">
                                        {values.subCategory2}
                                    </Tag>
                                )}
                            </Space>
                            <div
                                className="d-flex flex-row flex-wrap"
                                style={{ justifyContent: 'flex-start' }}
                            >
                                <RowItem
                                    title="Status"
                                    content={values.status}
                                />
                                <RowItem
                                    title="Priority"
                                    content={values.priority}
                                />
                                <RowItem
                                    title="Case Condition"
                                    content={values.state}
                                />
                                <RowItem
                                    title="Interaction Type"
                                    content={data.caseSource}
                                />
                                <RowItem
                                    title="Account Type"
                                    content={
                                        getAccountsType(
                                            accountTypeMetadata,
                                            data?.accountType
                                        ) || 'Individual'
                                    }
                                />
                                <RowItem
                                    title="Account Sub Type"
                                    content={
                                        getAccountsType(
                                            accountSubTypeMetadata,
                                            data?.accountSubType
                                        ) || 'N/A'
                                    }
                                />
                                {data?.caseHistory[0]?.assignedTeam && (
                                    <RowItem
                                        title="Case Queue"
                                        content={
                                            data?.caseHistory[0]?.assignedTeam
                                        }
                                    />
                                )}
                                <RowItem
                                    title="ETR"
                                    content={
                                        data.caseHistory[0]
                                            ?.estimatedResolutionTime
                                            ? new Date(
                                                  data?.caseHistory[0]?.estimatedResolutionTime
                                              ).toLocaleString()
                                            : 'N/A'
                                    }
                                />
                                {interactionIds &&
                                    interactionIds?.length > 0 && (
                                        <RowItem
                                            title="Interaction Id's"
                                            content={interactionIds?.join(',')}
                                        />
                                    )}
                                {additionalPropertiesArray?.map(
                                    ({ key, value }) => (
                                        <RowItem
                                            title={
                                                key.charAt(0).toUpperCase() +
                                                key.slice(1)
                                            }
                                            content={value}
                                        />
                                    )
                                )}
                            </div>
                            <RowItem
                                title="Description"
                                content={data?.description || 'N/A'}
                                isHtml
                            />
                            {(data?.caseHistory[0]?.summary ||
                                data?.caseHistory[0]?.resolution) && (
                                <RowItem
                                    title="Latest Notes"
                                    className="row-margin-top"
                                    content={
                                        data?.caseHistory[0]?.summary ||
                                        data?.caseHistory[0]?.resolution ||
                                        'N/A'
                                    }
                                    isHtml
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
