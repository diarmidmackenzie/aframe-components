const {FilesetResolver, FaceDetector} = require('@mediapipe/tasks-vision')

AFRAME.registerComponent('face-detector', {

  init() {
    
    this.lastVideoTime = 0
    this.video = document.createElement('video')
    this.video.autoplay = true
    this.video.playsInline = true
    document.body.appendChild(this.video)

    this.predictWebcam = this.predictWebcam.bind(this)

    // start face detector (completes asynchronously)
    this.startFaceDetector()
  },

  async startFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const faceDetector = await FaceDetector.createFromModelPath(vision,
      "https://storage.googleapis.com/mediapipe-tasks/face_detector/face_detection_short_range.tflite"
    );

    await faceDetector.setOptions({ runningMode: "VIDEO" });
    this.faceDetector = faceDetector

    // activate webcam
    stream = await navigator.mediaDevices.getUserMedia({ video: true })    
    this.video.srcObject = stream;
    this.video.addEventListener("loadeddata", this.predictWebcam);

  },

  async predictWebcam() {
  
    // Detect faces using detectForVideo
    let startTimeMs = performance.now();
    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      const detections = this.faceDetector.detectForVideo(this.video, startTimeMs)
        .detections;
      console.log(detections);
      this.el.emit('face-detected', detections)
    }
  
    // Call this function again to keep predicting when the browser is ready
    window.requestAnimationFrame(this.predictWebcam);
  }
})