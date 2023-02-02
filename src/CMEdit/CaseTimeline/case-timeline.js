import React, { useState } from 'react';
import { Steps, Button, Icon } from 'antd';
import Content from './Content';
import moment from 'moment';

const { Step } = Steps;

export default function CaseTimeline({
    data,
    caseHistory,
    caseError,
    showTable,
}) {
    const [current, setCurrent] = useState(0);

    const stepData = [...caseHistory]?.reverse();

    const nextStep = () => {
        const Ncurr = current + 1;
        setCurrent(Ncurr);
    };

    const prevStep = () => {
        const Pcurr = current - 1;
        setCurrent(Pcurr);
    };

    const handleChange = (current) => {
        setCurrent(current);
    };

    return (
        <div
            className="case-detail-data"
            style={{
                display: 'grid',
                gridTemplateColumns: showTable ? 'auto' : '30% auto',
            }}
        >
            <Steps
                progressDot
                current={current}
                size="default"
                className="progressDots"
                direction={showTable ? 'horizontal' : 'vertical'}
                onChange={(value) => handleChange(value)}
            >
                {stepData.map((step, index) => (
                    <Step
                        key={index}
                        title={step?.status?.toUpperCase()}
                        description={`Updated ${moment(step?.updatedAt).format(
                            'DD MMM YYYY, h:mm a'
                        )}`}
                    />
                ))}
            </Steps>

            <div style={{ padding: '1%' }}>
                {current > 0 && (
                    <Button
                        type="dashed"
                        onClick={prevStep}
                        className="navigation-button-left"
                    >
                        <Icon type="left" />
                        Previous
                    </Button>
                )}

                {current + 1 < stepData.length && (
                    <Button type="dashed" onClick={nextStep}>
                        Next
                        <Icon type="right" />
                    </Button>
                )}
                {/* Content */}
                <Content data={data} caseHistory={stepData} index={current} />
            </div>
        </div>
    );
}
