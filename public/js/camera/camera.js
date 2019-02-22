let video;
let canvas;
let ctx;
let network;

function startVideo() {
    network = posenet.load();
    video = document.getElementById("camera");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.setAttribute("width", 500);
    canvas.setAttribute("height", 500);
        
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.srcObject = stream;
            video.play();
        });
    }

    renderFrame();
    window.setInterval(renderFrame, 10);
    

}

function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var imageScaleFactor = 0.5;
    var outputStride = 16;
    var flipHorizontal = false;

    network.then(function(net){
      return net.estimateSinglePose(canvas, imageScaleFactor, flipHorizontal, outputStride)
    }).then(function(pose){
      // console.log(pose);
      drawSkeleton(pose, .1);
    }).catch(console.log);
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
  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
        toTuple(keypoints[0].position), toTuple(keypoints[1].position), "#00FF00",
        scale, ctx);
  });
  didAddressBall(keypoints);
}

function didAddressBall(keypoints) {
  var wristDistance = (((keypoints.keypoints[9]["position"].x - keypoints.keypoints[10]["position"].x + keypoints.keypoints[9]["position"].y - keypoints.keypoints[10]["position"].y)/2));
  var wrists = ((keypoints.keypoints[9]["position"].y + keypoints.keypoints[10]["position"].y)/2);
  var didAddressBall = false;
  var topOfBackswing = false;
  var impactPosition = false;
  var finishSwing = false;
  // Check that the keypoints confidence levels are high enough
  if (keypoints.keypoints[9]["score"] > .8 && 
      keypoints.keypoints[10]["score"] > .8 &&
      wristDistance < 30)  {
      console.log("Golfer has addressed ball");
      didAddressBall = true;
    }
    if (wrists < 200 && didAddressBall == true) {
      console.log("Golfer reached top of backswing");
      topOfBackswing = true;
    // }
    // if (wrists > 300 && topOfBackswing == true) {
    //   console.log("Golfer in impact position");
    //   impactPosition = true;
    // } 
    // if (wrists < 200 && impactPosition == true) {
    //   console.log("Golfer has finished golf swing");
    // }
      var firstAngle = Math.atan2((keypoints.keypoints[5]["position"].y - keypoints.keypoints[11]["position"].y),(keypoints.keypoints[5]["position"].x - keypoints.keypoints[11]["position"].x));
      var secondAngle = Math.atan2((keypoints.keypoints[6]["position"].y - keypoints.keypoints[11]["position"].y),(keypoints.keypoints[6]["position"].x - keypoints.keypoints[11]["position"].x));
      var angle = (firstAngle - secondAngle);
      console.log(angle)

      didAddressBall = false;
      // topOfBackswing = false;
      // impactPosition = false;
    }
    if (topOfBackswing == true) {
                responsiveVoice.speak("Your form looks good, just remember your front arm and back arm should be as straight as possible at impact with your front arm perfectly in line with your club shaft Your back shoulder should be dropped a bit below the height of your front shoulder This will allow your hands to remain ahead of your club head and your back foot to lift off the ground.");
    }
      // keypoints.keypoints[8]["position"].x && keypoints.keypoints[9]["position"].x
      // console.log(keypoints.keypoints[9]["position"].y);
    // responsiveVoice.speak("Your form looks good, just remember your front arm and back arm should be as straight as possible at impact, with your front arm perfectly in line with your club shaft. Your back shoulder should be dropped a bit below the height of your front shoulder. This will allow your hands to remain ahead of your club head, and your back foot to lift off the ground.");


}
