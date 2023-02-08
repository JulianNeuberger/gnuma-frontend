import React from 'react';

import {Button} from 'antd'

import {AnnoRelationSetContext} from '../AnnoRelationSetContextProvider/AnnoRelationSetContextProvider';
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";

// props
export type AnnoRelationSetTagsProps = {
    id: string;
}

// Displays the tags of a relation set.
// Useful for  showing relation types of a project.
export default function AnnoRelationSetTags(props: AnnoRelationSetTagsProps){

    const relationSetContext = React.useContext(AnnoRelationSetContext);

    React.useEffect(() => {
        relationSetContext.onFetchOne(props.id);
    }, []);

    // no context => display relation set id
    if (!relationSetContext.state.elements[props.id]) {
        return(
            <>
                {props.id}        
            </>
        );
    }

    // else display the tags.
    return(
        <>
            {
                relationSetContext.state.elements[props.id].relationTypes.map(label => {
                    return (
                        <Button style={getButtonStyle(label.color)} key={label.type}>
                            {label.type}
                        </Button>
                    );
                })
            }
        </>
        );
}