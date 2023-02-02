import React from 'react';

export default function RowItem({ title, content, isHtml, className }) {
    const date = title?.includes('DateTime')
        ? new Date(content).toLocaleString()
        : null;

    return (
        <div className={`data-item ${className}`}>
            <div className="data-item-header">{title}</div>
            {isHtml ? (
                <div
                    className="data-item-content"
                    dangerouslySetInnerHTML={{
                        __html: content,
                    }}
                />
            ) : (
                <div className="data-item-content">
                    {date ? date : content ? content : 'N/A'}
                </div>
            )}
        </div>
    );
}
