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
                end={props.rel.subject.sentenceId + '_' + props.rel.subject.tokenId}
                startAnchor={[{position: 'bottom', offset: {}}]}
                endAnchor={[{position: 'bottom', offset: {y: 10}}]}
                strokeWidth= {2}
                headSize={4}
                path={'straight'}
                showHead={false}
                color = {props.color}
            />
            <Xarrow 
                start={props.rel.subject.sentenceId + '_' + props.rel.subject.tokenId} 
                end={props.rel.object.sentenceId + '_' + props.rel.object.tokenId}
                startAnchor={[{position: 'bottom', offset: {y: 9}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'top', offset:{}}, {position: 'bottom', offset:{}}]}
                strokeWidth= {2}
                headSize={4}
                path={'straight'}
                color = {props.color}
                labels= {<span style= {{color: 'black' }}></span>}
            />
        </>
    );

}