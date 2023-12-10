# AWS File Resizificator Server
[![forthebadge](https://forthebadge.com/images/badges/made-with-typescript.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/docker-container.svg)](https://forthebadge.com)

A server software designed to allow users to change the resolution of their video files on the cloud.

<img src="https://github.com/Mistyttm/aws-cloud-video-converter/assets/51770769/194e62b6-7588-41a9-87b0-66ebeab01998" alt="Image of the File Resizificator home page" width="1000" height="auto">

## Installation

To install this on your AWS server, run an EC2 instance and install docker. then run

`docker create -p 80:8080 --restart always cab432team1/cloud-project:latest`

## Building
### Linux & MacOS
This application was built with the BunJS runtime in mind, but it can be easily swapped out for npm/node. To build and run the server locally follow these steps:
 1. Clone this repo.
 2. Clone the [client repo](https://github.com/Mistyttm/aws-file-resizificator-client).
 3. Inside the server repo run `bun i`.
    1. Inside the server repo run `bun compile`. A new dist folder should appear with the server compiled.
 4. Inside the client repo, run `bun i`.
    1. Run `bun run build`.
    2. Copy the output files into `aws-file-resizificator-server/dist/front-end/`.
 5. Run `bun start`.

### Windows
The Windows process requires access to a working WSL environment with bun installed. The steps are then the same as above.

## Scripts

- `bun dev`: Creates a hot reloading development environment
- `bun compile`: Compiles TS into native JS
- `bun start`: Runs the native JS as a server
