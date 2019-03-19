let video;
let canvas;
let ctx;
let network;
var state = 0;
var textCounter = 0;
var textLines = [];
let lastPose = null;
var isOn = false; // toggle posestimation on/off

async function startVideo() {
    network = await posenet.load();
    video = document.getElementById("camera");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.setAttribute("width", 600);
    canvas.setAttribute("height", 600);

    // Event listener that turns on/off posestimation frame renderer.
    document.getElementById("start").addEventListener("click", function(){
      isOn = !isOn;
    });

    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.srcObject = stream;
            video.play();
        });
    }

    renderFrame();
    window.setInterval(renderFrame, 50);
}

async function renderFrame() {
    var imageScaleFactor = 0.5;
    var outputStride = 16;
    var flipHorizontal = false;
    var maxPoseDetections = 3;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (isOn){
    if (lastPose !== null) {
      drawSkeleton(lastPose, .01);
    }
    renderText();
    var multiPose = await network.estimateMultiplePoses(canvas, imageScaleFactor, flipHorizontal, outputStride, maxPoseDetections);
    if (multiPose.length > 0) {
      lastPose = multiPose[0];
    } else {
      lastPose = null;
    }
  }
}

function renderText() {
  if (textCounter > 0) {
      ctx.font = '30px serif';
      ctx.fillStyle = "#000000";
      for (let i = 0; i < textLines.length; i++) {
        let t = ctx.measureText(textLines[i]);
        let x = (canvas.width - t.width) / 2;
        let y = (canvas.height - textLines.length * 48 * 1.3) / 2 + i * 1.3 * 48;
        ctx.fillText(textLines[i], x, y);
      }
      textCounter --;
    }
}

const connectedPartNames = [ ['leftHip', 'leftShoulder'], ['leftElbow', 'leftShoulder'], ['leftElbow', 'leftWrist'], ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'], ['rightHip', 'rightShoulder'], ['rightElbow', 'rightShoulder'], ['rightElbow', 'rightWrist'], ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'], ['leftShoulder', 'rightShoulder'], ['leftHip', 'rightHip'] ];
const partNames = [ 'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle' ];
const partIds = partNames.reduce((result, jointName, i) => { result[jointName] = i; return result; }, {});
const connectedPartIndices = connectedPartNames.map(([jointNameA, jointNameB]) => ([partIds[jointNameA], partIds[jointNameB]]));

function eitherPointDoesntMeetConfidence( a, b, minConfidence) {
  return (a < minConfidence || b < minConfidence);
}

function getAdjacentKeyPoints(keypoints, minConfidence) {
  return connectedPartIndices.reduce(
      (result, [leftJoint, rightJoint]) => {
        // console.log(keypoints, leftJoint, rightJoint);
        if (eitherPointDoesntMeetConfidence(
                keypoints[leftJoint].score, keypoints[rightJoint].score, minConfidence)) {
          return result;
        }

        result.push([keypoints[leftJoint], keypoints[rightJoint]]);

        return result;
      }, []);
}

function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function toTuple({y, x}) {
  return [y, x];
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawSkeleton(keypoints, minConfidence, scale = 1) {
  const adjacentKeyPoints =
      getAdjacentKeyPoints(keypoints.keypoints, minConfidence);
  didAddressBall(keypoints);
  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
        toTuple(keypoints[0].position), toTuple(keypoints[1].position), "#00FF00",
        scale, ctx);
  });
}

function didAddressBall(keypoints) {
  var wristDistance = (((keypoints.keypoints[9]["position"].x - keypoints.keypoints[10]["position"].x + keypoints.keypoints[9]["position"].y - keypoints.keypoints[10]["position"].y)/2));
  var wrists = ((keypoints.keypoints[9]["position"].y + keypoints.keypoints[10]["position"].y)/2);
  var waist = keypoints.keypoints[11]["position"].y;
  var shoulders = keypoints.keypoints[6]["position"].y;
  // Check that the keypoints confidence levels are high enough
  if (keypoints.keypoints[9]["score"] > .5 && 
      keypoints.keypoints[10]["score"] > .5 &&
      keypoints.keypoints[11]["score"] > .5 && 
      keypoints.keypoints[6]["score"] > .5){
    if (wrists > waist && wristDistance < 30 && state == 0)  {
      console.log("Golfer has addressed ball");
      state++;
    } else if (wrists < shoulders && state == 1) {
      console.log("Golfer reached top of backswing");
      state++;
    }
    else if (wrists > waist && state == 2) {
      console.log("Golfer in impact position");
      state++;
    } 
    else if (wrists < shoulders && state == 3) {
      console.log("Golfer has finished golf swing");
      state++;
    }
    else if (state == 4) {
        angleMeasurement(keypoints);
        voiceDidSpeak();
        state = 0;
    }
  }
}

function voiceDidSpeak() {
      let hips = ["Your form looks", "good turn your", "hips more in", "your downswing"];
      let straightArms = ["Remember your front arm", "and back arm should be", "as straight as possible at impact"];
      let frontArm = ["Put your front arm", "perfectly in line", "with your club shaft at impact."];
      let shoulders = ["Your back shoulder" ,"should be dropped a bit" ,"below the height of your front shoulder"];
      let hooking = ["At Impact your hands should", "remain AHEAD of", "your club head."];
    
      var body = [hips, straightArms, frontArm, shoulders, hooking];
      var i = Math.floor(Math.random() * body.length);
      textLines = body[i];
      textCounter = 200; 
      responsiveVoice.speak(textLines.join(" "));
}
function angleMeasurement(keypoints) {
    var firstAngle = Math.atan2((keypoints.keypoints[5]["position"].y - keypoints.keypoints[11]["position"].y),(keypoints.keypoints[5]["position"].x - keypoints.keypoints[11]["position"].x));
    var secondAngle = Math.atan2((keypoints.keypoints[6]["position"].y - keypoints.keypoints[11]["position"].y),(keypoints.keypoints[6]["position"].x - keypoints.keypoints[11]["position"].x));
    console.log(firstAngle,secondAngle);
    var angle = (firstAngle - secondAngle);
    console.log(angle);
}


