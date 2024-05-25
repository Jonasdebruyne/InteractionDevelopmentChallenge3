const classifier = ml5.imageClassifier("MobileNet", modelLoaded);
const takePictureButton = document.querySelector(".btn .border");
const flipButton = document.querySelector("#cameraFlip");
const outputContainer = document.querySelector(".output");
const output = document.querySelector(".output__image");
const outputData = document.querySelector(".output__data");
const h1Text = document.querySelector(".phone h1");
let currentStream;
let modelHasLoaded = false;

function modelLoaded() {
  console.log("Model has loaded!");
  modelHasLoaded = true;
}

const webcamElement = document.getElementById("webcam");
const canvasElement = document.getElementById("canvas");
const snapSoundElement = document.getElementById("snapSound");
const webcam = new Webcam(
  webcamElement,
  "user",
  canvasElement,
  snapSoundElement
);

async function getDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "videoinput");
  } catch (error) {
    console.error("Error getting devices:", error);
    return [];
  }
}

async function getStream(deviceId) {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }
    const constraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
      },
    };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    webcamElement.srcObject = currentStream;
    const videoTrack = currentStream.getVideoTracks()[0];
    currentDeviceId = videoTrack.getSettings().deviceId;
  } catch (error) {
    console.error("Error getting stream:", error);
  }
}

async function startWebcam() {
  const devices = await getDevices();
  if (devices.length > 0) {
    await getStream(devices[0].deviceId);
  }
}

async function flipCamera() {
  const devices = await getDevices();
  if (devices.length > 1) {
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === currentDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    await getStream(devices[nextIndex].deviceId);
  }
}

async function takeAndClassifyPicture() {
  try {
    const picture = webcam.snap();
    const outputImage = document.createElement("img");
    outputImage.src = picture;
    output.innerHTML = "";
    output.appendChild(outputImage);
    outputContainer.style.display = "flex";
    webcamElement.style.display = "none";
    if (modelHasLoaded) {
      h1Text.style.display = "none";
      classifier.classify(outputImage, (err, results) => {
        outputData.innerHTML = "";
        if (results && results.length > 0) {
          const confidentResults = results.filter(
            (result) => result.confidence >= 0.1
          );
          if (confidentResults.length > 0) {
            h1Text.innerText = confidentResults[0].label;
          } else {
            h1Text.innerText = "No result found";
          }
        } else {
          h1Text.innerText = "No result found";
        }
        h1Text.style.display = "block";
      });
    }
  } catch (error) {
    console.error("Error taking and classifying picture:", error);
  }
}

startWebcam();
flipButton.addEventListener("click", flipCamera);
takePictureButton.addEventListener("click", takeAndClassifyPicture);

function toggleYellow() {
  if (this.classList.contains("yellow")) {
    this.classList.remove("yellow");
  } else {
    this.classList.add("yellow");
  }
}

document.querySelector(".fa-flash").addEventListener("click", toggleYellow);

document
  .querySelector(".phone .top img")
  .addEventListener("click", function () {
    if (this.src.includes("images/live.svg")) {
      this.src = "images/liveYellow.svg";
    } else {
      this.src = "images/live.svg";
    }
  });

document.querySelector(".tryAgain").addEventListener("click", function () {
  location.reload();
});
