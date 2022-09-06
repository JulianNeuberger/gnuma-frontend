import React from 'react';

import {Tag} from 'antd'

import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider';

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
                        <Tag color={label.color} key={label.name}>
                            {label.name.toUpperCase()}
                        </Tag>
                    );
                })
            }
        </>
        );
}