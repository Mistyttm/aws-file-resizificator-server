import './App.css'
import { SetStateAction, useState } from 'react';

function App() {
  // Set resolution to the option selected from the menu
  const [value, setValue] = useState('resolution');

  const selectResolution = (event: { target: { value: SetStateAction<string>; }; }) => {
    setValue(event.target.value);
    console.log(event.target.value);
  };

  async function uploadVideo() {
    // Get video file input from user
    const videoFile = document.getElementById('fileInput') as HTMLInputElement;
    const video = videoFile?.files?.[0];
    console.log(video);

    // File upload code sourced from: https://uploadcare.com/blog/how-to-upload-file-in-react/
    // Add the uploaded video file to the form data object
    if (video) {
      const formData = new FormData();
      formData.append('video', video);

      try {
        // POST form data object containing the video file
        const response = await fetch('/api/v1/files/uploadFile', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log(data);

      } catch (error) {
        console.error('Error uploading file: ', error);
      }
    }
  }

  return (
    <>
      <div className="mainContainer">
        <h2>Unnamed: Cloud Project</h2>
        <h4>Team 1</h4>
        <input type="file" id="fileInput" />
        <button type="button" onClick={uploadVideo}>Upload File</button>

        <select name="resolution" id="res" value={value} onChange={selectResolution}>
          <option value="426x240">426x240</option>
          <option value="640x360">640x360</option>
          <option value="854x480">854x480</option>
          <option value="1280x720">1280x720</option>
          <option value="1920x1080">1920x1080</option>
          <option value="2560x1440">2560x1440</option>
          <option value="3840x2160">3840x2160</option>
        </select>

      </div>
    </>
  );
}

export default App;
