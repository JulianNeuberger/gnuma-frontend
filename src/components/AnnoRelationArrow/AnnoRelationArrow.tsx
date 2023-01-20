import Xarrow from "react-xarrows";
import {Relation} from "../../state/anno/annoDocumentReducer";

// props needed for the arrow.
type AnnoRelationArrowProps = {
    rel: Relation;
    color: string;
    selectRelation: (id: string) => void;
    selectedRelation: string;
    selectedEntities: string[];
}

// Return the arrow of a relation from one span to another.
export default function AnnoRelationArrow(props: AnnoRelationArrowProps) {

    // bigger if seleceted
    const getStrokeWidth = () => {
        if (props.selectedEntities.includes(props.rel.head) || props.selectedEntities.includes(props.rel.tail)) {
            return 5;
        }
        return 2;
    }

    return(
        <>
            <Xarrow
                start={props.rel.head}
                end={props.rel.tail}
                startAnchor={[{position: 'bottom', offset: {y: 9}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'left', offset: {y: -10}}, { position: 'right', offset: {y: -10}}, {position: 'top', offset:{}}, {position: 'bottom', offset:{}}]}
                strokeWidth= {getStrokeWidth()}
                headSize={4}
                path={'straight'}
                color = {props.color}
                passProps={
                    {onClick: () => {
                            // todo ctrl click impl possible?
                            props.selectRelation(props.rel.id);
                        }}
                }
            />
            <Xarrow
                start={props.rel.head}
                end={props.rel.head}
                startAnchor={[{position: 'bottom', offset: {}}]}
                endAnchor={[{position: 'bottom', offset: {y: 10}}]}
                strokeWidth= {getStrokeWidth()}
                path={'straight'}
                showHead={false}
                color = {props.color}
                passProps={
                    {onClick: () => {
                        // todo ctrl click impl possible?
                        props.selectRelation(props.rel.id);
                    }}
                }
            />
        </>
    );

}