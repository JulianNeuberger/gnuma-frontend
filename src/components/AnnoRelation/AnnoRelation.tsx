import React from 'react';

import {presetPalettes} from '@ant-design/colors';

import {Relation} from '../../views/AnnoDetailsView'

// Props needed for displaying a relation
type AnnoRelationProps = {
    rel: Relation;

    elementSelected: boolean;
    selected: boolean;

    setSelectedRelation: (rel: Relation) => void;
}

// Display a relation
export default function AnnoRelation(props: AnnoRelationProps){

    // get the style of the relation
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

    // Return the relation.
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