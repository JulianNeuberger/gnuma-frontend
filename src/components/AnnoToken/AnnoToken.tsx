import React from 'react';

import {presetPalettes} from '@ant-design/colors';

type AnnoTokenProps = {
    sentenceId: number;
    tokenId: number;
    token: string;
    style: React.CSSProperties;
    select: (sentenceId: number, tokenId: number) => void;
    ctrlSelect: (sentenceId: number, tokenId: number) => void;
    shftSelect: (sentenceId: number, tokenId: number) => void;
} 

export default function AnnoToken(props: AnnoTokenProps){


    const [borderWidth, setBorderWidth] = React.useState<number>(1);

    return (
        <span
            style={{
                ...props.style,
                'borderWidth': '5px',
                'borderRadius': 3,
                'padding': '1px'
            }}
            onClick={ (e) => {
                if (e.ctrlKey) {
                    props.ctrlSelect(props.sentenceId, props.tokenId);
                } else if (e.shiftKey) {
                    props.shftSelect(props.sentenceId, props.tokenId);
                } else {
                    props.select(props.sentenceId, props.tokenId);
                }
            }}
        >
            {props.token}
        </span>
    );
}