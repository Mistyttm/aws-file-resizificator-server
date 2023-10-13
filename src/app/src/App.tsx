import './App.css'

function App() {

  async function testButton() {
    console.log("Button works!");

    const testMessage = "Test router";

    try {
      const response = await fetch("/uploadFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage }),
      });

      if (response.ok) {
       const data = await response.json();
       console.log("yay");
       console.log(data);
      } else {
          console.log("Error - POST was unsuccessful.");
      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <>
    <div className="mainContainer">
      <h2>Unnamed: Cloud Project</h2>
      <h4>Team 1</h4>
      <button type="button" id="uploadButton" onClick={testButton}>Upload File</button>
      
      {/* Todo: change positioning of resolution selection menu */}
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
  )
}

export default App
