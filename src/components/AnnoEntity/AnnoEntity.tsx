import React from 'react';
import {Entity} from "../../state/anno/annoDocumentReducer";

// props needed for a token
type AnnoEntityProps = {
    entity: Entity;
    text: string;
    style: React.CSSProperties;

    selectEntity: (id: string) => void;
    ctrlSelectEntity: (id: string) => void;
} 

// display a token or span
export default function AnnoEntity(props: AnnoEntityProps){

    return (
        <span
            id = {props.entity.id}
            style={{
                ...props.style,
                'padding': '0.2px',
                'whiteSpace': 'pre'
            }}
            onClick={ (e) => {
                // event based on click type
                if (e.ctrlKey) {
                    props.ctrlSelectEntity(props.entity.id);
                } else if (e.shiftKey) {
                    // nothing for entities
                } else {
                    props.selectEntity(props.entity.id);
                }
            }}
        >
            {props.text}
        </span>
    );
}