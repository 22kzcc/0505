let video;
let facemesh;
let predictions = [];
let displayW, displayH;

// --- 1. 定義各部位的特徵點編號陣列 ---

// 保留原本的嘴唇
const lipsIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

// 右眼輪廓 (MediaPipe 標準右眼特徵點)
const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// 左眼輪廓 (MediaPipe 標準左眼特徵點，246 就在這個結構的眼角附近)
const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];

// 臉部最外層輪廓
const faceOutlineIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  displayW = width * 0.5;
  displayH = height * 0.5;

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("Model Ready!");
}

function draw() {
  background('#e7c6ff');

  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("教科123456789", width / 2, height * 0.15);

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  imageMode(CENTER);
  image(video, 0, 0, displayW, displayH);

  drawFeatures(); 
  
  pop();
}

function drawFeatures() {
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;

    // --- 繪製臉部最外層輪廓 (藍色，線條粗細 2) ---
    stroke(0, 0, 255);
    strokeWeight(2);
    drawPathWithLines(keypoints, faceOutlineIndices, true);

    // --- 保留嘴唇畫線 (紅色，線條粗細 15) ---
    stroke(255, 0, 0);
    strokeWeight(15);
    drawPathWithLines(keypoints, lipsIndices, true);

    // --- 繪製右眼 (綠色，線條粗細 2) ---
    stroke(0, 255, 0); 
    strokeWeight(2);
    drawPathWithLines(keypoints, rightEyeIndices, true);

    // --- 繪製左眼 (黃色，線條粗細 2) ---
    stroke(255, 255, 0);
    strokeWeight(2);
    drawPathWithLines(keypoints, leftEyeIndices, true);

    // --- 針對單一點位 247 與 246 獨立畫圈 ---
    // 247 外圈
    if (keypoints[247]) {
      let p247 = keypoints[247];
      let x247 = map(p247[0], 0, video.width, -displayW / 2, displayW / 2);
      let y247 = map(p247[1], 0, video.height, -displayH / 2, displayH / 2);
      
      stroke(255, 100, 0); // 橘色表示外圈
      strokeWeight(2);
      noFill();
      circle(x247, y247, 20); 
    }

    // 246 內圈
    if (keypoints[246]) {
      let p246 = keypoints[246];
      let x246 = map(p246[0], 0, video.width, -displayW / 2, displayW / 2);
      let y246 = map(p246[1], 0, video.height, -displayH / 2, displayH / 2);
      
      stroke(255, 200, 0); // 黃色表示內圈
      strokeWeight(2);
      noFill();
      circle(x246, y246, 8); 
    }
  }
}

// --- 2. 負責使用 line() 指令串接陣列特徵點的函式 ---
function drawPathWithLines(keypoints, indices, isClosed) {
  for (let i = 0; i < indices.length; i++) {
    // 檢查是否需要將最後一點連回起點
    if (i < indices.length - 1 || isClosed) {
      let p1 = keypoints[indices[i]];
      // 如果是最後一點且需要封閉，就連回陣列的第 0 個點
      let nextIndex = (i === indices.length - 1) ? 0 : i + 1;
      let p2 = keypoints[indices[nextIndex]];

      // 將座標映射到目前的畫布比例上
      let x1 = map(p1[0], 0, video.width, -displayW / 2, displayW / 2);
      let y1 = map(p1[1], 0, video.height, -displayH / 2, displayH / 2);
      let x2 = map(p2[0], 0, video.width, -displayW / 2, displayW / 2);
      let y2 = map(p2[1], 0, video.height, -displayH / 2, displayH / 2);

      // 使用 line 指令繪製兩點之間的連線
      line(x1, y1, x2, y2);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  displayW = width * 0.5;
  displayH = height * 0.5;
}