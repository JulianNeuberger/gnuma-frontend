import {Card, Checkbox, Col, Input, Row, Select, Slider, Tooltip} from 'antd';
import {QuestionCircleOutlined} from '@ant-design/icons';


export type ConfigurationVariable<T extends 'string' | 'integer' | 'float' | 'boolean'> = {
    name: string;
    description: string;
    type: T;
    multiple?: boolean;
};

export type IntConfigurationVariable = ConfigurationVariable<'integer'> & {
    default?: number;
    value?: number;
    min?: number;
    max?: number;
    choices?: number[];
};

export type FloatConfigurationVariable = ConfigurationVariable<'float'> & {
    default?: number;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    choices?: number[];
};

export type StringConfigurationVariable = ConfigurationVariable<'string'> & {
    default?: string;
    value?: string;
    choices?: string[];
};

export type BooleanConfigurationVariable = ConfigurationVariable<'boolean'> & {
    default?: boolean;
    value?: boolean;
}

export type ConfigurationVariableTypes =
    IntConfigurationVariable
    | FloatConfigurationVariable
    | StringConfigurationVariable
    | BooleanConfigurationVariable;

export type Configuration = { [id: string]: ConfigurationVariableTypes }

export type ConfigurationDisplayPropsType = {
    configuration: Configuration;
    onChange: (newConfiguration: Configuration) => void;
}

export class NoConfigurationError extends Error {
}

export function parseConfiguration(obj: { [key: string]: any }): Configuration {
    const parseVariable = (variableId: string, variable: { [key: string]: any }) => {
        if (!('name' in variable)) {
            throw new NoConfigurationError(`Missing name in configuration variable ${variableId}`);
        }

        if (!('description' in variable)) {
            throw new NoConfigurationError(`Missing description in configuration variable ${variableId}`);
        }

        switch (variable.type) {
            case 'integer':
                const intVariable: IntConfigurationVariable = {
                    type: 'integer',
                    name: variable.name,
                    description: variable.description,
                    default: variable.default,
                    min: variable.min,
                    max: variable.max,
                    choices: variable.choices
                };
                return intVariable;
            case 'float':
                const floatVariable: FloatConfigurationVariable = {
                    type: 'float',
                    name: variable.name,
                    description: variable.description,
                    default: variable.default,
                    min: variable.min,
                    max: variable.max,
                    step: variable.step,
                    choices: variable.choices
                };
                return floatVariable;
            case 'string':
                const stringVariable: StringConfigurationVariable = {
                    type: 'string',
                    name: variable.name,
                    description: variable.description,
                    default: variable.default,
                    choices: variable.choices
                };
                return stringVariable;
            case 'boolean':
                const booleanVariable: BooleanConfigurationVariable = {
                    type: 'boolean',
                    name: variable.name,
                    description: variable.description,
                    default: variable.default
                };
                return booleanVariable;
            default:
                throw new NoConfigurationError(`Unknown config variable type ${variable.type}`);
        }
    }

    return Object.keys(obj).reduce((cur: Configuration, variableId: string) => {
        const variable = obj[variableId];
        cur[variableId] = parseVariable(variableId, variable);
        return cur;
    }, {});
}

export function ConfigurationDisplay(props: ConfigurationDisplayPropsType) {
    const renderChoices = (variableId: string, variable: ConfigurationVariableTypes) => {
        if ('choices' in variable) {
            return (
                <Select style={{width: '100%'}} value={variable.default}>
                    {
                        variable.choices?.map((v) => {
                            return (
                                <Select.Option value={v}>{v}</Select.Option>
                            );
                        })
                    }
                </Select>
            );
        }
    }

    const renderIntVariable = (variableId: string, variable: IntConfigurationVariable) => {
        return (
            <Slider
                min={variable.min}
                max={variable.max}
                value={variable.value}
                defaultValue={variable.default}
                step={1}
                onChange={(v) => {
                    if (typeof v === 'number') {
                        props.onChange({
                            ...props.configuration,
                            [variableId]: {
                                ...variable,
                                value: v
                            }
                        })
                    }
                }}
            />
        );
    }

    const renderFloatVariable = (variableId: string, variable: FloatConfigurationVariable) => {
        return (
            <Slider
                min={variable.min}
                max={variable.max}
                value={variable.value}
                defaultValue={variable.default}
                step={variable.step}
                onChange={(v) => {
                    if (typeof v === 'number') {
                        props.onChange({
                            ...props.configuration,
                            [variableId]: {
                                ...variable,
                                value: v
                            }
                        })
                    }
                }}
            />
        );
    }

    const renderStringVariable = (variableId: string, variable: StringConfigurationVariable) => {
        return (
            <Input
                value={variable.value}
                defaultValue={variable.default}
                onChange={(e) => {
                    props.onChange({
                        ...props.configuration,
                        [variableId]: {
                            ...variable,
                            value: e.target.value
                        }
                    })
                }}
            />
        );
    }

    const renderBooleanVariable = (variableId: string, variable: BooleanConfigurationVariable) => {
        return (
            <Checkbox
                checked={variable.value}
                defaultChecked={variable.default}
                onChange={(e) => {
                    props.onChange({
                        ...props.configuration,
                        [variableId]: {
                            ...variable,
                            value: e.target.checked
                        }
                    })
                }}
            />
        )
    }

    const renderVariable = (variableId: string, variable: ConfigurationVariableTypes) => {
        if ('choices' in variable && variable.choices && variable.choices.length > 0) {
            return renderChoices(variableId, variable);
        }
        switch (variable.type) {
            case 'integer':
                return renderIntVariable(variableId, variable);
            case 'float':
                return renderFloatVariable(variableId, variable);
            case 'string':
                return renderStringVariable(variableId, variable);
            case 'boolean':
                return renderBooleanVariable(variableId, variable);
        }
    }

    return (
        <Card>
            <Row gutter={[16, 16]}>
                {
                    Object.keys(props.configuration).flatMap((variableId: string) => {
                        const variable = props.configuration[variableId];
                        return [
                            <Col span={8} style={{textAlign: 'right'}}>
                                <Tooltip
                                    title={variable.description}
                                >
                                    {variable.name} <QuestionCircleOutlined/>
                                </Tooltip>
                            </Col>,
                            <Col span={16}>
                                {renderVariable(variableId, variable)}
                            </Col>
                        ];
                    })
                }
            </Row>
        </Card>
    );
}