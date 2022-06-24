//Author: Alicja Kiluk
import React from 'react';
import {Component} from 'react';
import axios from 'axios';
import { Button, Card, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import {UploadOutlined} from '@ant-design/icons';

interface ConvertFormatViewProps {}
interface ConvertFormatViewState{
    //selected file can be of type File or null
    selectedFile : File | null
    fileList : UploadFile[]
}

class ConvertFormatView extends Component<ConvertFormatViewProps, ConvertFormatViewState> {

    constructor(props : ConvertFormatViewProps) {
        super(props);
        //at the beginning, no file is uploaded
        this.state = {
            selectedFile : null,
            fileList : Array<UploadFile>(),
        }
    };
//on file change
    onFileChange = (file:RcFile) => {
        this.setState({...this.state, selectedFile: file});
        return false;
    };
//on file upload
    onFileUpload = () => {
        const formData = new FormData();
        if (this.state.selectedFile)
        {
            formData.append(
                "myFile",
                this.state.selectedFile,
                this.state.selectedFile.name
            );
        }
        console.log(this.state.selectedFile);
        //post data as binary to server
        axios.post("api/uploadfile", formData);
        return false;
    };

    handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
        let newFileList = [...info.fileList];
        newFileList = newFileList.slice(-1);
        this.setState({...this.state, fileList : newFileList});
    };

    render() {
        return (
            <div key={'converter-view'}>
                <Card title={'NLP format converter'}>
                    <h3>Upload your file</h3>
                    <div>
                        <Upload beforeUpload={this.onFileChange} fileList={this.state.fileList} onChange={this.handleChange}>
                            <Button icon={<UploadOutlined />}>Upload file</Button>
                        </Upload>
                        <br/>
                        <button type="button" className="ant-btn ant-btn-primary" onClick={this.onFileUpload}>Convert file</button>
                    </div>
                </Card> 
            </div>
        );
    }
}
export default ConvertFormatView;
