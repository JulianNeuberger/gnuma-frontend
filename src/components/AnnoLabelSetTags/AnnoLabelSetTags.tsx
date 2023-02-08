import React from 'react';

import {Button} from 'antd'

import {AnnoLabelSetContext} from '../AnnoLabelSetContextProvider/AnnoLabelSetContextProvider';
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";

// Props
export type AnnoLabelSetTagsProps = {
    id: string;
}

// Display a list of label tags.
// Useful for showing all label set tags used by a project.
export default function AnnoLabelSetTags(props: AnnoLabelSetTagsProps){

    const labelSetContext = React.useContext(AnnoLabelSetContext);

    React.useEffect(() => {
        labelSetContext.onFetchOne(props.id);
    }, []);

    // context not loaded => display label set id.
    if (!labelSetContext.state.elements[props.id]) {
        return(
            <>
                {props.id}        
            </>
        );
    }

    // Else return the tags.
    return(
        <>
            {
                labelSetContext.state.elements[props.id].labels.map(label => {
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