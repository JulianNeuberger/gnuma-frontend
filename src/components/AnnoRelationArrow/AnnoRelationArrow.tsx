import Xarrow from "react-xarrows";

import {Relation} from '../../views/AnnoDetailsView'

// props needed for the arrow.
type AnnoRelationArrowProps = {
    rel: Relation;
    color: string;
}

// Return the arrow of a relation from one span to another.
export default function AnnoRelationArrow(props: AnnoRelationArrowProps) {

    return(
        <>
            <Xarrow 
                start={props.rel.subject.sentenceId + '_' + props.rel.subject.tokenId} 
                end={props.rel.object.sentenceId + '_' + props.rel.object.tokenId}
                startAnchor={[{position: 'top', offset: {x: 5}}, {position: 'bottom', offset: {x: 5}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'top', offset: {x: -5}}, {position: 'bottom', offset: {x: -5}}]}
                strokeWidth= {2}
                headSize={4}
                path={'smooth'}
                color = {props.color}
                labels= {<span style= {{color: 'black' }}></span>}
            />
        </>
    );

}