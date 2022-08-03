import {Layout, Button, Space} from 'antd';
import Xarrow from "react-xarrows";

import {Relation} from '../../views/AnnoDetailsView'


type AnnoRelationArrowProps = {
    rel: Relation;
}

export default function AnnoRelationArrow(props: AnnoRelationArrowProps) {

    return(
        <>
            <Xarrow 
                start={props.rel.subject.sentenceId + '_' + props.rel.subject.tokenId} 
                end={props.rel.object.sentenceId + '_' + props.rel.object.tokenId}
                startAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'top', offset: {x: 5}}, {position: 'bottom', offset: {x: 5}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'top', offset: {x: -5}}, {position: 'bottom', offset: {x: -5}}]}
                strokeWidth= {2}
                headSize={4}
                path={'straight'}  
                color = {'grey'}
                labels= {<span style= {{color: 'black' }}></span>}
            />
        </>
    );

}