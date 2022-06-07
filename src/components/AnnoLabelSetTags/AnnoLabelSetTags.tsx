import React from 'react';

import {Tag} from 'antd'

import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider';

export type AnnoLabelSetTagsProps = {
    id: string;
}

export default function AnnoLabelSetTags(props: AnnoLabelSetTagsProps){

    const labelSetContext = React.useContext(AnnoLabelSetContext);

    React.useEffect(() => {
        labelSetContext.onFetchOne(props.id);
    }, []);

    if (!labelSetContext.state.elements[props.id]) {
        return(
            <>
                {props.id}        
            </>
        );
    }

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