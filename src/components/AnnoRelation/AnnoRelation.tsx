import React from 'react';

import {presetPalettes} from '@ant-design/colors';

import {Relation} from "../../state/anno/annoDocumentReducer";

// Props needed for displaying a relation
type AnnoRelationProps = {
    rel: Relation;

    getText: (sentenceId: number, tokenId: number) => string;

    elementSelected: boolean;
    selected: boolean;

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

    // Returns the text for a relation.
    const getText = (sentenceId: number, tokenId: number) => {

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
        </div>
    );
}