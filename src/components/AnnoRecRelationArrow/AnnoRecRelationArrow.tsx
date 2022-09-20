import Xarrow from "react-xarrows";
import {RecRelation} from "../../state/anno/annoDocumentReducer";

// props needed for the arrow.
type AnnoRecRelationArrowProps = {
    rel: RecRelation;
    color: string;
}

// Return the arrow of a relation from one span to another.
export default function AnnoRecRelationArrow(props: AnnoRecRelationArrowProps) {

    return(
        <>
            <Xarrow
                start={props.rel.head}
                end={props.rel.head}
                startAnchor={[{position: 'bottom', offset: {}}]}
                endAnchor={[{position: 'bottom', offset: {y: 10}}]}
                strokeWidth= {2}
                path={'straight'}
                showHead={false}
                color = {props.color}
                dashness={true}
            />
            <Xarrow
                start={props.rel.head}
                end={props.rel.tail}
                startAnchor={[{position: 'bottom', offset: {y: 9}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'top', offset:{}}, {position: 'bottom', offset:{}}]}
                strokeWidth= {2}
                headSize={4}
                path={'straight'}
                color = {props.color}
                dashness={true}
            />
        </>
    );

}