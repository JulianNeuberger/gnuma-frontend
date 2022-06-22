import React from 'react';

import {Text} from 'react-native';
import {presetPalettes} from '@ant-design/colors';

type AnnoTokenProps = {
    sentenceId: number;
    tokenId: number;
    token: string;
    color?: string;
    borderColor?: string;
    background?: string;
}

export default function AnnoToken(props: AnnoTokenProps){

    const [color, setColor] = React.useState<string>(props.color || 'black');
    const [background, setBackground] = React.useState<string>(props.background || 'white');
    const [borderColor, setBorderColor] = React.useState<string>(props.borderColor || 'white');
    const [borderWidth, setBorderWidth] = React.useState<number>(1);

    return (
        <Text
            style={{
                'color': color,
                'borderColor': borderColor,
                'backgroundColor': background,
                'borderWidth': borderWidth,
                'borderRadius': 3
            }}
            onPress={
                () => {
                    setBorderWidth(3);
                    setBorderColor('black');
                }
            }
        >
            {props.token}
        </Text>
    );
}