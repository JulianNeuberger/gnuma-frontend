import Xarrow from "react-xarrows";
import {RecRelation} from "../../state/anno/annoDocumentReducer";

// props needed for the arrow.
type AnnoRecRelationArrowProps = {
    rel: RecRelation;
    color: string;

    isRecEntity: (id: string) => boolean;
    selectRecRelation: (id: string) => void;

    selectedRecRelation: string;
}

// Return the arrow of a relation from one span to another.
export default function AnnoRecRelationArrow(props: AnnoRecRelationArrowProps) {

    const getId = (id: string) => {
        if (props.isRecEntity(id)) {
            return 'rec_' + id;
        }
        return id;
    }

    // bigger if seleceted
    const getStrokeWidth = () => {
        if (props.rel.id === props.selectedRecRelation) {
            return 4;
        }
        return 2;
    }

    return(
        <>
            <Xarrow
                start={getId(props.rel.head)}
                end={getId(props.rel.head)}
                startAnchor={[{position: 'bottom', offset: {}}]}
                endAnchor={[{position: 'bottom', offset: {y: 10}}]}
                strokeWidth= {getStrokeWidth()}
                path={'straight'}
                showHead={false}
                color = {props.color}
                dashness={true}
                passProps={
                    {onClick: () => {
                            props.selectRecRelation(props.rel.id);
                        }}
                }
            />
            <Xarrow
                start={getId(props.rel.head)}
                end={getId(props.rel.tail)}
                startAnchor={[{position: 'bottom', offset: {y: 9}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'left', offset: {y: -10}}, { position: 'right', offset: {y: -10}}, {position: 'top', offset:{}}, {position: 'bottom', offset:{}}]}
                strokeWidth= {getStrokeWidth()}
                headSize={4}
                path={'straight'}
                color = {props.color}
                dashness={true}
                passProps={
                    {onClick: () => {
                            props.selectRecRelation(props.rel.id);
                        }}
                }
            />
        </>
    );

}