import React from 'react';

import {presetPalettes} from '@ant-design/colors';

import {Relation} from '../../views/AnnoDetailsView'

type AnnoRelationProps = {
    rel: Relation;

    elementSelected: boolean;
    selected: boolean;

    setSelectedRelation: (rel: Relation) => void;
}

export default function AnnoRelation(props: AnnoRelationProps){

    const getStyle = () => {
        //default
        let style: React.CSSProperties = {
            'color': 'black',
            'background': 'white',
            'padding': 2
        };
        if (props.selected) {
            style = {
                'color': presetPalettes['grey'][8],
                'background': presetPalettes['grey'][1],
                'padding': 2
            };
        }
        
        // add border if relSelected
        if (props.elementSelected) {
            style = {
                ...style,
                'border': '2px solid black'
            }
        }

        return style;
    }

    return (
        <div
            style = {getStyle()}
            onClick = {() => {
                /*
                if (props.selected) {
                    props.setSelectedRelation(undefined);
                } else {
                    props.setSelectedRelation(props.rel)
                }
                */
            }}
        >
            {props.rel.subject.token}{' --- '}{props.rel.predicate}{' ---> '}{props.rel.object.token}
        </div>
    );
}