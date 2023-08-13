const {FilesetResolver, HandLandmarker} = require('@mediapipe/tasks-vision')

AFRAME.registerComponent('hand-landmarker', {

  schema: {
    showVideo: {default: true},
    videoTop: {default: '10px'},
    videoLeft: {default: '10px'},
    videoWidth: {default: '200px'}
  },

  init() {
    
    this.lastVideoTime = 0
    this.video = document.createElement('video')
    this.video.autoplay = true
    this.video.playsInline = true
    this.video.style.position = "absolute"
    this.video.style.top = this.data.videoTop
    this.video.style.left = this.data.videoLeft
    this.video.style.zIndex = this.data.showVideo ? 10 : -10
    this.video.style.width = this.data.videoWidth
    this.video.style.height = 'auto'
    this.video.style.transform = 'rotateY(180deg)'

    document.body.appendChild(this.video)

    this.eventData = {
      video: this.video,
      handData: null
    }

    this.predictWebcam = this.predictWebcam.bind(this)

    // start face detector (completes asynchronously)
    this.startHandLandmarker()
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
        numHands: 2
      }
    );

    await handLandmarker.setOptions({ runningMode: "VIDEO" });
    this.handLandmarker = handLandmarker

    // activate webcam
    stream = await navigator.mediaDevices.getUserMedia({ video: true })    
    this.video.srcObject = stream;
    this.video.addEventListener("loadeddata", this.predictWebcam);

  },

  async predictWebcam() {
  
    // Detect hands using detectForVideo
    const startTimeMs = performance.now();
    if (this.video.currentTime !== this.lastVideoTime) {

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
      }
      catch(err) {
        console.log("Exception hit in Mediapipe")
        console.log(err)
        console.log("Restarting")
        await startHandLandmarker();
      };

      this.lastVideoTime = this.video.currentTime;
    }
  
    // Call this function again to keep predicting when the browser is ready
    window.requestAnimationFrame(this.predictWebcam);
  }
})