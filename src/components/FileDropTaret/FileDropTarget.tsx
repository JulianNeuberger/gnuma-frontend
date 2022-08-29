import React from 'react';
import {useDropzone} from 'react-dropzone';

import './FileDropTarget.css';
import {DownloadOutlined} from '@ant-design/icons';


export type FileDropTargetPropsType = {
    onFilesDropped: (files: File[]) => void;
}

export default function FileDropTarget(props: FileDropTargetPropsType) {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDropAccepted: props.onFilesDropped});

    const renderDropzone = () => {
        let title = 'Click or drop files to upload';
        let className = 'dropzone';
        if (isDragActive) {
            title = 'Drop files here';
            className += ' dropzone-active'
        }

        return (
            <div className={className}>
                <div>
                    {title}
                </div>
                <DownloadOutlined style={{fontSize: 32, color: '#AAA'}}/>
            </div>
        );
    }

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {renderDropzone()}
        </div>
    )
}