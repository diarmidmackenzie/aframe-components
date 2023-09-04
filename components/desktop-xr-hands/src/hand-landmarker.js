const {FilesetResolver, HandLandmarker} = require('@mediapipe/tasks-vision')
const {drawConnectors, drawLandmarks} = require('@mediapipe/drawing_utils')
const HAND_CONNECTIONS = [[0, 1],
                          [1, 2],
                          [2, 3], 
                          [3, 4], 
                          [0, 5], 
                          [5, 6], 
                          [6, 7], 
                          [7, 8], 
                          [5, 9], 
                          [9, 10], 
                          [10, 11], 
                          [11, 12], 
                          [9, 13], 
                          [13, 14], 
                          [14, 15], 
                          [15, 16], 
                          [13, 17], 
                          [0, 17],
                          [17, 18], 
                          [18, 19], 
                          [19, 20]]

AFRAME.registerComponent('hand-landmarker', {

  schema: {
    // plane for output in video mode
    videoOutput: {type: 'selector'},
    
  },

  init() {
    
    // video will need to be in-scene to be visible in Immersive mode...
    this.lastVideoTime = 0
    this.video = document.createElement('video')
    this.video.id = THREE.MathUtils.generateUUID()
    this.video.autoplay = true
    this.video.playsInline = true

    document.body.appendChild(this.video)

    this.canvas = document.createElement("canvas");
    this.canvas.width = 512
    this.canvas.height = 512
    this.canvas.id = THREE.MathUtils.generateUUID()
    this.canvasCtx = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas)

    this.eventData = {
      video: this.video,
      handData: null
    }

    this.predictWebcam = this.predictWebcam.bind(this)

    // start face detector (completes asynchronously)
    this.startHandLandmarker()
  },

  update() {
    if (this.data.videoOutput) {
      this.data.videoOutput.setAttribute('src', `#${this.canvas.id}`)

      this.video.addEventListener('play', () => {
        const heightRatio = this.video.videoHeight / this.video.videoWidth
        
        // adjust height to match video & flip horizontally.
        this.data.videoOutput.setAttribute('scale', `-1 ${heightRatio} 1`)
      })
    }
  },

  remove() {
    this.data.videoOutput.setAttribute('src', '')
    if (this.video) {
      // shut down webcam
      const stream = this.video.srcObject
      const track = stream.getTracks()[0]
      track.stop();

      // remove video El.
      this.video.parentNode.removeChild(this.video)
      this.video = null
    }

    // stop the landmarker
    this.handLandmarker = null
  },

  async startHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
        },
        numHands: 2,
        minHandDetectionConfidence: 0.25,
        minHandPresenceConfidence: 0.25,
        minTrackingConfidence: 0.25,
        runningMode: "LIVE_STREAM"
      }
    );

    this.handLandmarker = handLandmarker

    // activate webcam
    stream = await navigator.mediaDevices.getUserMedia({ video: true })    
    this.video.srcObject = stream;
    this.video.addEventListener("loadeddata", this.predictWebcam);

  },

  async predictWebcam() {
  
    // Detect hands using detectForVideo
    const startTimeMs = performance.now();
    if (this.video && this.video.currentTime !== this.lastVideoTime) {

      try {
        //console.log("Analyzing video for hand landmarks")
        const result = this.handLandmarker.detectForVideo(this.video, startTimeMs)
        
        if (result.handednesses && result.handednesses.length) {
          // recognized some hands
          this.eventData.handData = result;
          this.el.emit('hands-detected', this.eventData)
        }

        const dur = performance.now() - startTimeMs
        //console.log(`Analysis took: ${dur} msecs`)

        this.updateCanvas(result)
      }
      catch(err) {
        console.log("Exception hit in Mediapipe")
        console.log(err)
        console.log("Restarting")
        await this.startHandLandmarker();
      };

      this.lastVideoTime = this.video.currentTime;
    }
  
    // Call this function again to keep predicting when the browser is ready.
    // include a brief pause to ensure CPU is not completely swamped by landmarking processing.
    if (this.handLandmarker) {
      setTimeout(() => {
        window.requestAnimationFrame(this.predictWebcam);
      }, 10)
    }
  },
  
  updateCanvas(result) {
    const canvasCtx = this.canvasCtx
    const canvasElement = this.canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(this.video, 0, 0, canvasElement.width, canvasElement.height)
    if (result.landmarks) {
      for (const landmarks of result.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    canvasCtx.restore();

  }
})