# AWS File Resizificator Server

<img src="https://github.com/Mistyttm/aws-cloud-video-converter/assets/51770769/194e62b6-7588-41a9-87b0-66ebeab01998" alt="Image of the File Resizificator home page" width="1000" height="auto">

## Usage
To utilise this application, you must open up the ip where the application is hosted.

## Installation

To install this on your AWS server, run an EC2 instance and install docker. then run

`docker create -p 80:8080 --restart always cab432team1/cloud-project:latest`

## Scripts

- `bun dev`: Creates a hot reloading development environment
- `bun compile`: Compiles TS into native JS
- `bun start`: Runs the native JS as a server
