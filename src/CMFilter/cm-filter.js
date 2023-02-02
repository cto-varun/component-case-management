import React, { useState } from 'react';
import { Select, Tag } from 'antd';
import { Authors } from './helpers';
import './styles.css';

const typeOptions = [
    { value: 'activation', label: 'Activation' },
    { value: 'accountNumber', label: 'Account Number' },
    { value: 'author', label: 'Author' },
];
const authorOptions = Authors.map((item) => ({
    value: item,
    label: item,
}));

const FilterTag = (props) => {
    const { label, closable, onClose } = props;

    return (
        <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
            {label}
        </Tag>
    );
};

const CMFilter = () => {
    const [selectData, setSelectData] = useState([]);
    const [options, setOptions] = useState(typeOptions);
    const [mode, setMode] = useState('multiple');

    const handleChangeFilter = (res) => {
        if (res.length > selectData.length) {
            if (selectData.length && !selectData[selectData.length - 1].value) {
                const lastFilter = selectData[selectData.length - 1];
                if (lastFilter.type === 'orderStepStatus') {
                    lastFilter.value = options.find(
                        (opt) => opt.value === res[res.length - 1]
                    );
                } else {
                    const updatedData = selectData.map((item, i, arr) => {
                        if (i === arr.length - 1) {
                            return { ...item, value: res[res.length - 1] };
                        }
                        return item;
                    });
                    setSelectData(updatedData);
                }
                setOptions(
                    typeOptions.filter(
                        (type) =>
                            !selectData.find(
                                (opt) => opt.type.label === type.label
                            )
                    )
                );
                setMode('tags');
            } else {
                const optionData = options.find(
                    (opt) => opt.value === res[res.length - 1]
                );
                if (optionData) {
                    setSelectData([
                        ...selectData,
                        {
                            type: optionData,
                        },
                    ]);
                }

                if (res[res.length - 1] === 'orderStepStatus') {
                    setOptions(authorOptions);
                    setMode('multiple');
                } else {
                    if (optionData) {
                        setOptions([]);
                    } else {
                        setOptions(typeOptions);
                    }
                    setMode('tags');
                }
            }
        }
    };

    const handleRemoveFilter = (label) => {
        const [typeLabel] = label.split(' = ');
        const result = selectData.filter(
            (item) => item.type.label !== typeLabel
        );
        setSelectData(result);
        if (mode === 'multiple') {
            const dropdown = typeOptions.filter(
                (typeOption) =>
                    !result.find((item) => item.type.value === typeOption.value)
            );
            setOptions(dropdown);
        }
        if (mode === 'tags') {
            setOptions(
                typeOptions.filter(
                    (typeOption) =>
                        !result.find((opt) => {
                            return opt.type.label === typeOption.label;
                        })
                )
            );
        }
    };

    return (
        <div className="cm-filter-search-box">
            <Select
                mode="tags"
                className="search-box-select"
                dropdownMatchSelectWidth={50}
                allowClear
                placeholder="Type search parameter (Order Id, Account Number, Status etc.) to add a filter..."
                value={selectData.map(
                    (opt) => `${opt.type?.label} = ${opt.value || ''}`
                )}
                onChange={handleChangeFilter}
                style={{ width: '100%' }}
                options={options}
                tagRender={(props) => (
                    <FilterTag
                        {...props}
                        onClose={(e) => {
                            handleRemoveFilter(props.label);
                            props.onClose(e);
                        }}
                    />
                )}
            />
        </div>
    );
};

export default CMFilter;
