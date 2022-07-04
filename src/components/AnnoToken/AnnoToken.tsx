import React from 'react';

import {presetPalettes} from '@ant-design/colors';

type AnnoTokenProps = {
    sentenceId: number;
    tokenId: number;
    token: string;
    style: React.CSSProperties;
    setSelection: (selection: TokenIndex) => void;
}

export type TokenIndex = {
    sentenceId: number;
    tokenId: number;
}

export default function AnnoToken(props: AnnoTokenProps){


    const [borderWidth, setBorderWidth] = React.useState<number>(1);

    return (
        <span
            style={{
                ...props.style,
                'borderWidth': 2,
                'borderRadius': 3
            }}
            onClick={ () => {
                props.setSelection({'sentenceId': props.sentenceId, 'tokenId': props.tokenId})
            }}
        >
            {props.token}
        </span>
    );
}