import React from 'react';

import {Tag} from 'antd'

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider';

export type AnnoRelationSetTagsProps = {
    id: string;
}

export default function AnnoRelationSetTags(props: AnnoRelationSetTagsProps){

    const relationSetContext = React.useContext(AnnoRelationSetContext);

    React.useEffect(() => {
        relationSetContext.onFetchOne(props.id);
    }, []);

    if (!relationSetContext.state.elements[props.id]) {
        return(
            <>
                {props.id}        
            </>
        );
    }

    return(
        <>
            {
                relationSetContext.state.elements[props.id].relationTypes.map(label => {
                    return (
                        <Tag color={label.color} key={label.predicate}>
                            {label.predicate}
                        </Tag>
                    );
                })
            }
        </>
        );
}