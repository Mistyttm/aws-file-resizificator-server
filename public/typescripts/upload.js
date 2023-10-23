// Todo: Change to typescript
document.getElementById("res").addEventListener("click", async function() {
    const resolutionSelect = document.getElementById("res");
    const selectedResolution = resolutionSelect.value;

    if (selectedResolution) {
        // POST selected resolution to the server
        const response = await fetch("/uploadFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ selectedResolution })
        });

        if (response.ok) {
            console.log("Resolution choice sent successfully.");
        } else {
            console.log("Error - POST was unsuccessful.");
        }
    } else {
        console.log("Error - could not retrieve video resolution choice.");
    }
});

