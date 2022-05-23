import React from 'react'

import {AnnoLabelSetContext} from '../../components/AnnoContextProvider/AnnoLabelSetContextProvider'
import {LabelSet, Label} from '../../state/anno/annoLabelSetReducer'

import {Form, Input, Divider, Button, Tag} from 'antd'

import {FieldData} from 'rc-field-form/lib/interface';


export type AnnoLabelSetCreationProps = {
    name?: string;
    labels?: Label[];
    colors?: string[];
}


export default function AnnoLabelSetCreation(props: AnnoLabelSetCreationProps){

    const labelSetConext = React.useContext(AnnoLabelSetContext);

    const [name, setName] = React.useState<string>(props.name || '');
    const [labelName, setLabelName] = React.useState<string>('');
    const [labels, setLabelSets] = React.useState<Label[]>(props.labels || []);
    const [colors, setColors] = React.useState<string[]>(props.colors || ['red', 'green', 'blue', 'yellow', 'magenta', 'orange', 'cyan', 'purple', 'lime', 'greekblue', 'gold', 'volcano']);

    const addLabel = () => {
        let newColors = colors;
        let newLabelSets = labels;

        newLabelSets.push({
            'name': labelName,
            'color': newColors.shift()!
        })

        setColors(newColors);
        setLabelSets(newLabelSets);
        setLabelName('');
    }

    return (
        <div>
            <Form id='metaForm'>
                <Form.Item
                    label={'Label Set Name'}
                    name={'name'}
                    required={true}
                >
                    <Input 
                        type='text' 
                        placeholder='Name of the project' 
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                </Form.Item>
            </Form>

            <Divider/>

            <Form id='add_label'>
                <Form.Item
                    label={'Label Name'}
                    name={'label'}
                >
                    <Input
                        type='text'
                        id='label_name'
                        onChange={(e) => setLabelName(e.target.value)}
                        value={labelName}
                        style={{width: '300px'}}
                        placeholder='Add a Label'
                    />
                    <Divider type={'vertical'}/>
                    <Button
                        type='primary'
                        onClick={addLabel}
                    >
                        Add Label
                    </Button>
                </Form.Item>
            </Form>

            <Divider/>

            <>
                {
                    labels.map(label => {
                        return (
                            <Tag color={label.color} key={label.name}>
                                {label.name.toUpperCase()}
                            </Tag>
                        );
                    })
                }
            </>
        </div>
        );
}