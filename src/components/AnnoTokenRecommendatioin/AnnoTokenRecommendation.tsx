import React from 'react';
import AnnoToken from "../AnnoToken/AnnoToken";
import {Button} from "antd";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";

// props needed for a token recommendation
type AnnoTokenRecomendationProps = {
    sentenceId: number;
    tokenId: number;
    token: string;
    labelLength: number;
    style: React.CSSProperties;

    select: (sentenceId: number, tokenId: number, labelLength: number) => void;
    ctrlSelect: (sentenceId: number, tokenId: number, labelLength: number) => void;
    shftSelect: (sentenceId: number, tokenId: number) => void;
}

//REturn token rec component
export default function AnnoTokenRecommendation(props: AnnoTokenRecomendationProps){
    return (
        <span style={{'border': '2px solid black'}}>
            <AnnoToken
                sentenceId={props.sentenceId}
                tokenId={props.tokenId}
                token={props.token}
                labelLength={props.labelLength}
                style={props.style}
                select={props.select}
                ctrlSelect={props.ctrlSelect}
                shftSelect={props.shftSelect}
            />
            <Button
                icon={
                    <CheckCircleTwoTone
                        twoToneColor={'green'}
                    />
                }
                type={'text'}
                size={'large'}
                onClick={() => console.log('yiiihaaaw')}
            />
            <Button
                icon={
                    <CloseCircleTwoTone
                        twoToneColor={'red'}
                    />}
                type={'text'}
                size={'large'}
                onClick={() => console.log('noppers')}
            />
        </span>
    );
}