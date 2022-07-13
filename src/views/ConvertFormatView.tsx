// Author: Alicja Kiluk
import React from 'react';
import {Component} from 'react';
import axios from 'axios';
import { Button, Card, Dropdown, Menu, Select, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import {UploadOutlined, DownOutlined} from '@ant-design/icons';
import { SelectValue } from 'antd/lib/select';

interface ConvertFormatViewProps {}
interface ConvertFormatViewState{
    // Selected file can be of type File or null
    selectedFile : File | null
    // List of uploaded files
    fileList : UploadFile[]
    // Format of the uploaded file
    conversionFrom : string
    // Format one wishes to convert to
    conversionTo : string
}

class ConvertFormatView extends Component<ConvertFormatViewProps, ConvertFormatViewState> {

    constructor(props : ConvertFormatViewProps) {
        super(props);
        this.state = {
            // At the beginning, no file is uploaded
            selectedFile : null,
            fileList : Array<UploadFile>(),
            // Formats selected by default
            conversionFrom : "auto",
            conversionTo : "conll",
        }
    };
// On file change
    onFileChange = (file:RcFile) => {
        this.setState({...this.state, selectedFile: file});
        return false;
    };
// On file upload
    onFileUpload = () => {
        const formData = new FormData();
        if (this.state.selectedFile)
        {
            formData.append(
                "filename",
                this.state.selectedFile.name
            );
            formData.append(
                "source_format",
                this.state.conversionFrom
            );
            formData.append(
                "target_format",
                this.state.conversionTo
            );
            formData.append(
                "file",
                this.state.selectedFile
            );
        }
        console.log(this.state.selectedFile);
        // Post data as binary to server
        axios.post("api/uploadfile", formData);
        return false;
    };

    // Update file list
    handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
        let newFileList = [...info.fileList];
        //restrict upload to 2 files (ConLL, GMB and MUC need 1 file, BRAT needs 2)
        newFileList = newFileList.slice(-2);
        this.setState({...this.state, fileList : newFileList});
    };

    // Select format of uploaded file
    selectOriginFormat =(value: SelectValue) => {
        if(value)
        {
            this.setState({...this.state, conversionFrom : value?.toString()});
        }
    };

    // Select format for conversion
    selectConversionFormat =(value: SelectValue) => {
        if(value)
        {
            this.setState({...this.state, conversionTo : value?.toString()});
        }
    };

    render() {
        return (
            <div key={'converter-view'}>
                <Card title={'NLP format converter'}>
                    <div>
                        <Upload beforeUpload={this.onFileChange} fileList={this.state.fileList} onChange={this.handleChange}>
                            <Button icon={<UploadOutlined />}>Upload file</Button>
                        </Upload>
                        <br/>
                        <span>Select the format of your file: </span>
                        <Select defaultValue="auto" style={{width: '20%'}} onChange={this.selectOriginFormat}>
                            <Select.Option value="auto">Automatically detect format</Select.Option>
                            <Select.Option value="conll">ConLL</Select.Option>
                            <Select.Option value="brat">BRAT</Select.Option>
                            <Select.Option value="muc">MUC</Select.Option>
                            <Select.Option value="gmb">GMB</Select.Option>
                        </Select>
                        <br />
                        <br />
                        <span>Select the format you wish to convert to: </span>
                        <Select defaultValue="conll" style={{width: '20%'}} onChange={this.selectConversionFormat}>
                            <Select.Option value="conll">ConLL</Select.Option>
                            <Select.Option value="brat">BRAT</Select.Option>
                            <Select.Option value="muc">MUC</Select.Option>
                            <Select.Option value="gmb">GMB</Select.Option>
                        </Select>
                        <br />
                        <br />
                        <button type="button" className="ant-btn ant-btn-primary" onClick={this.onFileUpload}>Convert file</button>
                    </div>
                </Card> 
            </div>
        );
    }
}
export default ConvertFormatView;
