import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {AnnoDocumentContext} from '../../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoLabelSetTags from '../../components/AnnoLabelSetTags/AnnoLabelSetTags';

type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    labelSetId: string;
}

type Label = {
    tag: string;
    start: number;
    end: number;
}

type StyledText = {
    text: string;
    style: React.CSSProperties;
}

export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [labels, setLabels] = React.useState<Label[]>([]);
    const [styledText, setStyledText] = React.useState<StyledText[]>([]);

    //todo remove this
    const [sel, setSel] = React.useState<any>();

    const documentContext = React.useContext(AnnoDocumentContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);

    React.useEffect(() => {
        documentContext.onFetchOne(props.projectId, props.docId);
        labelSetContext.onFetchOne(props.labelSetId);
    }, []);

    if(!documentContext.state.elements[props.docId]  || !labelSetContext.state.elements[props.labelSetId]){
        return (<>loading...</>);
    }

    const doc = documentContext.state.elements[props.docId];
    const labelSet = labelSetContext.state.elements[props.labelSetId];

    const getStyle = (tag: string) => {
        if (tag == 'O') {
            return ({});
        }

        let col = '';
        labelSetContext.state.elements[props.labelSetId].labels.map(label => {
            if (label.name === tag) {
                col = label.color;
            }
        })

        if (col == '') {
            return ({});
        }

        return ({
            'color': presetPalettes[col][7],
            'background': presetPalettes[col][1],
            'borderColor': presetPalettes[col][3],
            'borderWidth': 1,
            'borderRadius': 3
        });
    }

    const updateStyledText = () => {
        let newStyledText: StyledText[] = [];
        let text = doc.text;

        // todo sort labels or sorted from beginning
        let lab = labels
        lab.sort((a,b) => (a.start < b.start) ? -1 : 1);

        if (!labels.length) {
            newStyledText.push({'text': text, 'style': {}});
            setStyledText(newStyledText);
        }

        let current = 0;
        labels.forEach( (lab) => {
            newStyledText.push({'text': text.substring(current, lab.start), 'style': {}});
            newStyledText.push({'text': text.substring(lab.start, lab.end), 'style': getStyle(lab.tag)});
            current = lab.end;
        });

        newStyledText.push({'text': text.substring(current, text.length), 'style': {}});

        setStyledText(newStyledText);
    }

    const display = (labels: Label[]) => {
        if (!styledText.length) {
            return(
                <span>
                    {doc.text}
                </span>
            )
        }
        return(
            <span>
                {
                    (styledText.map( (ele) => {
                        return(
                            <span style={ele.style}>
                                {ele.text}
                            </span>
                        )
                    }))
                }
            </span>
        )
    }

    return (
        <Layout>
            <Layout.Header
                style={{backgroundColor: 'White'}}
            >
                <Space>
                    {
                        labelSet.labels.map(label => {
                            return (
                                <Button 
                                    style={{
                                        'color': presetPalettes[label.color][7],
                                        'background': presetPalettes[label.color][1],
                                        'borderColor': presetPalettes[label.color][3]
                                    }} 
                                    key={label.name}
                                    onClick={ () => {
                                        let sel = window.getSelection();                                       
                                        if (sel && !sel.isCollapsed) {
                                            let offset = 0;
                                            setSel(sel.anchorNode);
                                            if (sel.anchorNode && sel.anchorNode.previousSibling){
                                                console.log('OwO')
                                            }
                                            let newLabels = labels;
                                            newLabels.push({
                                                'tag': label.name,
                                                'start': sel.anchorOffset,
                                                'end': sel.focusOffset
                                            })
                                            setLabels(newLabels);
                                            sel.collapseToEnd();
                                            updateStyledText();
                                        }
                                    }}
                                >
                                    {label.name.toUpperCase()}
                                </Button>
                                
                            );
                        })
                    }
                </Space> 
            </Layout.Header>
            <Layout.Content
                style={{backgroundColor: 'White'}}
            >
                <p
                    style={{'fontSize': '15px', 'lineHeight': 1.5}}
                >
                    {display(labels)}
                </p>
            </Layout.Content>
        </Layout>
    );
}