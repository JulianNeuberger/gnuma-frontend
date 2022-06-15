//Author: Alicja Kiluk
import React from 'react';
import {Component} from 'react';
import axios from 'axios';

interface ConvertFormatViewProps {}
interface ConvertFormatViewState{
    //selected file can be of type File or null
    selectedFile : File | null
}

class ConvertFormatView extends Component<ConvertFormatViewProps, ConvertFormatViewState> {

    constructor(props : ConvertFormatViewProps) {
        super(props);
        this.state = {
            selectedFile : null
        }
    };

    onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let uploadedFile : File | null;
        if (event.target.files)
        {
            uploadedFile = event.target.files[0];
        }
        else
        {
            uploadedFile = null;
        }
        this.setState({selectedFile: uploadedFile});
    };

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
        axios.post("api/uploadfile", formData);
    };

    fileData = () => {
        if (this.state.selectedFile)
        {
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>
                </div>
            );
        }
        else
        {
            return (
                <div>
                    <br />
                    <h4>Please choose a file before pressing the upload button</h4>
                </div>
            );
        }
    };

    render() {
        return (
            <div>
                <h3>Upload your file</h3>
                <div>
                    <input type="file" onChange={this.onFileChange} />
                    <button onClick={this.onFileUpload}>Upload file</button>
                </div>
                {this.fileData()}
            </div>
        );
    }
}
export default ConvertFormatView;
