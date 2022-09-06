import React from 'react';

import {presetPalettes} from '@ant-design/colors';

type AnnoTokenProps = {
    sentenceId: number;
    tokenId: number;
    token: string;
    labelLength: number;
    style: React.CSSProperties;

    select: (sentenceId: number, tokenId: number, labelLength: number) => void;
    ctrlSelect: (sentenceId: number, tokenId: number, labelLength: number) => void;
    shftSelect: (sentenceId: number, tokenId: number) => void;
} 

export default function AnnoToken(props: AnnoTokenProps){

    return (
        <span
            id = {props.sentenceId + '_' + props.tokenId}
            style={{
                ...props.style,
                'padding': '0.2px'
            }}
            onClick={ (e) => {
                if (e.ctrlKey) {
                    props.ctrlSelect(props.sentenceId, props.tokenId, props.labelLength);
                } else if (e.shiftKey) {
                    props.shftSelect(props.sentenceId, props.tokenId);
                } else {
                    props.select(props.sentenceId, props.tokenId, props.labelLength);
                }
            }}
        >
            {props.token}
        </span>
    );
}