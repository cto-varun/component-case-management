import React from 'react';
import { Dropdown, Menu, Space, Button } from 'antd';
import {
    DownloadOutlined,
    FileExcelOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { ExportTableButton } from 'ant-table-extensions';

export const EBBFilters = (props) => {
    const { selectedRows, ebbCSVHeaders } = props;

    return (
        <Space className="ebb-table-filters" size={20}>
            <ExportTableButton
                dataSource={selectedRows}
                columns={ebbCSVHeaders}
                fileName="Cases"
                btnProps={{
                    type: 'primary',
                    icon: <FileExcelOutlined />,
                }}
                showColumnPicker
            >
                Export to CSV
            </ExportTableButton>
            <Button type="primary">
                Update
                <DownloadOutlined />
            </Button>
        </Space>
    );
};
