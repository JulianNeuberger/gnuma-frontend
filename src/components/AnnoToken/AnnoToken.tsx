import React from 'react';
import {presetPalettes} from "@ant-design/colors";

// props needed for a token
type AnnoTokenProps = {
    sentenceIndex: number;
    start: number;
    end: number;
    text: string;
    selected: boolean;

    selectToken: (sentenceIndex: number, start: number, end: number) => void;
    ctrlSelectToken: (sentenceIndex: number, start: number, end: number) => void;
    shftSelectToken: (sentenceIndex: number, start: number, end: number) => void;
}

// display a token or span
export default function AnnoToken(props: AnnoTokenProps) {

    const getStyle = () => {
        if (props.selected) {
            return ({
                'color': presetPalettes['grey'][8],
                'background': presetPalettes['grey'][1],
                'padding': '0.2px'
            });
        }

        return ({
            'color': 'black',
            'background': 'white',
            'padding': '0.2px'
        });
    }

    return (
        <span
            style={getStyle()}
            onClick={(e) => {
                // event based on click type
                if (e.ctrlKey) {
                    props.ctrlSelectToken(props.sentenceIndex, props.start, props.end);
                } else if (e.shiftKey) {
                    props.shftSelectToken(props.sentenceIndex, props.start, props.end);
                } else {
                    props.selectToken(props.sentenceIndex, props.start, props.end);
                }
            }}
        >
            {props.text}
        </span>
    );
}
