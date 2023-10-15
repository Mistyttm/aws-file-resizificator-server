import './App.css'

function App() {

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

      //src/server/routes/v1/filesRoute.ts
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
        
        <form method="POST" action="/import" encType="multipart/form-data">
          <input type="file" id="fileInput" />
        </form>
        
        <button type="button" onClick={uploadVideo}>Upload File</button>
        
        <select name="resolution" id="res">
          <option value="1">426x240</option>
          <option value="2">640x360</option>
          <option value="3">854x480</option>
          <option value="4">1280x720</option>
          <option value="5">1920x1080</option>
          <option value="6">2560x1440</option>
          <option value="7">3840x2160</option>
        </select>
      </div>
    </>
  );
}

export default App;
