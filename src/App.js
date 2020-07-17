import React, {Component} from 'react';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null,
        loaded: 0,
        previewsrc: ""
      }
  }

checkFileSize=(event)=>{
let file = event.target.files[0]
 if (file && file.size > 2147483648) { 
         toast.error('File is over 2 GB.  Please compress your file and then try again.');
         event.target.value = null;
        return false;
    }
  return true;
}

checkFileExtension=(event)=>{
  let file = event.target.files[0]
  if(file){
  if (file.type === 'image/jpeg' || file.type === 'video/mp4') {
    return true;
  }
  else {
       toast.error(file.type+' is not a supported format.  Please upload a JPEG or MP4 file.')
       event.target.value = null;
       return false;
     }}
}

  fileSelected = (event) => {
    console.log(event.target.files[0])
    if(event.target.files[0] === undefined){
      this.setState({
        selectedFile: null,
      })
    }
    if(this.checkFileSize(event) && this.checkFileExtension(event)){ 
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
}};

uploadFile = (event) => {
  event.preventDefault()
  if(this.state.selectedFile){
  document.getElementById('upload-button').classList.add('hide')
  document.getElementById('progress-bar').classList.remove('hide')
  const data = new FormData() 
  data.append('file', this.state.selectedFile)
  axios.post("http://localhost:3050/upload", data, { 
    onUploadProgress: ProgressEvent => {
      this.setState({
        loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
    })
  },
})
.then(res => {
  toast.success('Upload successful!')
  document.getElementById('upload-button').classList.remove('hide')
  document.getElementById('progress-bar').classList.add('hide')
})
.catch(err => { 
  toast.error('Upload failed. Please try again.')
  document.getElementById('upload-button').classList.remove('hide')
  document.getElementById('progress-bar').classList.add('hide')
})
} else {
  toast.error('Please select a file.')
}
}

importFiles(r) {
  return r.keys().map(r);
}
mapFiles = () => {
  let listOfImages = this.importFiles(require.context('../files/'));
  let imageMap = listOfImages.map((image, index) => {
    let title=image.split('/')[3]
    if(image.split('.').pop()==="jpg"){   
    return (<div className="media-block" key={index}><img src={image} alt="thumbnail" className="thumbnail" actualsrc={image} onClick={this.thumbnailClicked}></img><p className="thumbnail-title">{title}</p></div>)
    } else {
    return (<div className="media-block" key={index}><img src="https://blog.axelradclinic.com/wp-content/uploads/2015/06/video-thumbnail.jpg" alt="thumbnail" actualsrc={image} className="thumbnail" onClick={this.thumbnailClicked}></img><p className="thumbnail-title">{title}</p></div>)
    }
  })
  return imageMap
}
thumbnailClicked = (event) => {
  this.setState({
    previewsrc: event.target.getAttribute("actualsrc")
  })
  let fileType = event.target.getAttribute("actualsrc").split('.').pop()
  if(fileType==="jpg"){
    document.getElementById("modal-image").classList.remove("hide")
  } else {
    document.getElementById("modal-video").classList.remove("hide")
  }
  document.getElementById("modal").classList.remove("hide")
  document.getElementById("modal-overlay").classList.remove("hide")
}

closePreview = () => {
  document.getElementById("modal").classList.add("hide")
  document.getElementById("modal-overlay").classList.add("hide")
  document.getElementById("modal-image").classList.add("hide")
  document.getElementById("modal-video").classList.add("hide")
  this.setState({
    previewsrc: ""
  })
}

changeSpeed = (e) => {
  document.querySelector('video').playbackRate = e.target.value;
}
  
render(){
  return (
    <div className="dashboard">
         <ToastContainer />
      <div className="file-box">
      <form onSubmit={this.uploadFile}>
        <input type="file" className="file-input" accept=".mp4,.jpg" onChange={this.fileSelected}/>
        <input id="upload-button" type="submit" value="Upload" className="upload-button"/>
        <Progress id="progress-bar" className="hide" max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded,2) }%</Progress>
      </form>
      </div>
      <div>
        <this.mapFiles/>
        <div className="modal hide" id="modal">
        <button className="closeButton" onClick={this.closePreview}>X</button>
          <img id="modal-image" src={this.state.previewsrc} alt="preview" className="preview-image hide"></img>
          <video id="modal-video" className="preview-video hide" controls autoPlay src={this.state.previewsrc} type="video/mp4"></video>
        <select className="playback-speed" onChange={this.changeSpeed} defaultValue="1.0">
        <option value="0.5">0.5x</option>
          <option value="1.0">1.0x</option>
          <option value="2.0">2.0x</option>
          <option value="3.0">3.0x</option>
        </select>
        </div>
        <div className="modal-overlay hide" id="modal-overlay" onClick={this.closePreview}></div>
      </div>
</div>  
  )
}
}
