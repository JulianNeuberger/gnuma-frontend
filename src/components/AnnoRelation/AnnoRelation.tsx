import React from 'react';

import {presetPalettes} from '@ant-design/colors';

type AnnoRelationProps = {
    name: string;
    content: string[];
    highlighted: boolean;
    updateRelation: (name: string, content: string[]) => void;
}

export default function AnnoRelation(props: AnnoRelationProps){

    const getStyle = () => {
        if (props.highlighted) {
            return ({
                'color': presetPalettes['grey'][8],
                'background': presetPalettes['grey'][1],
                'borderColor': presetPalettes['grey'][2]
            });
        }
        return ({
            'color': 'black',
            'background': 'white',
            'borderColor': 'white'
        });
    }

    const displayContent = () => {
        return (
            <span>
                (
                {
                    props.content.map((con, x) => {
                        if (x === props.content.length - 1) {
                            return (<>{con}</>);
                        }
                        return(<>{con}, </>)
                    })
                }
                )
            </span>
        );
    }

    return (
        <div
            style = {getStyle()}
        >
            {props.name}{' -> '}{displayContent()}
        </div>
    );
}