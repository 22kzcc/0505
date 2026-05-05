let video;
let facemesh;
let predictions = [];
let displayW, displayH;

// --- 各部位特徵點陣列 ---
// 1. 保留原本的嘴唇
const pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

// 2. 新增的嘴唇線條
const newMouthIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 3. 右眼與左眼
const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];

// 4. 臉部最外層輪廓
const faceOutlineIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];


function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 計算影像顯示尺寸
  updateDisplaySize();

  // 設定攝影機
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 初始化 Facemesh
  facemesh = ml5.facemesh(video, () => console.log("模型準備完畢！"));
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  // 確保保留你原本的粉紅背景
  background('#e7c6ff');

  // 確保保留你原本的文字設定
  noStroke();
  fill(0); 
  textSize(windowHeight * 0.04); 
  textAlign(CENTER, CENTER);
  text("教科123456789", width / 2, height * 0.15);

  // 影像與辨識線條處理
  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  // 繪製影像
  imageMode(CENTER);
  image(video, 0, 0, displayW, displayH);

  // 繪製所有臉部特徵
  drawFacemeshLines();
  pop();
}

function drawFacemeshLines() {
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;

    // ==========================================
    // 第一步：在臉部外層輪廓外填滿 #fdf0d5 (遮罩效果)
    // ==========================================
    fill('#fdf0d5');
    noStroke();
    beginShape();
    // 1. 順時針畫出整個影片的外框
    vertex(-displayW / 2, -displayH / 2);
    vertex(displayW / 2, -displayH / 2);
    vertex(displayW / 2, displayH / 2);
    vertex(-displayW / 2, displayH / 2);

    // 2. 逆時針畫出臉部輪廓，將臉部的部分「挖空」
    beginContour();
    for (let i = faceOutlineIndices.length - 1; i >= 0; i--) {
      let p = keypoints[faceOutlineIndices[i]];
      let x = map(p[0], 0, video.width, -displayW / 2, displayW / 2);
      let y = map(p[1], 0, video.height, -displayH / 2, displayH / 2);
      vertex(x, y);
    }
    endContour();
    endShape(CLOSE);


    // ==========================================
    // 第二步：繪製特徵點線條 (全面使用 line 指令)
    // ==========================================

    // 1. 臉部輪廓 (螢光藍色，粗細 2)
    stroke(0, 255, 255); // 螢光藍色
    strokeWeight(2);
    drawLineSequence(keypoints, faceOutlineIndices, true);

    // 2. 保留你最原始的嘴唇設定 (紅色，粗細 15)
    stroke(255, 0, 0);
    strokeWeight(15);
    drawLineSequence(keypoints, pointIndices, true);

    // 3. 你新要求的嘴唇線條 (紅色，粗細 1)
    stroke(255, 0, 0);
    strokeWeight(1);
    drawLineSequence(keypoints, newMouthIndices, true);

    // 4. 左眼與右眼 - 黑眼圈效果 (灰色偏黑，粗細 15)
    stroke(50, 50, 50); // 偏黑的灰色
    strokeWeight(15);
    drawLineSequence(keypoints, rightEyeIndices, true);
    drawLineSequence(keypoints, leftEyeIndices, true);

    // 5. 獨立繪製 247 外圈 與 246 內圈
    if (keypoints[247]) {
      let p247 = keypoints[247];
      let x247 = map(p247[0], 0, video.width, -displayW / 2, displayW / 2);
      let y247 = map(p247[1], 0, video.height, -displayH / 2, displayH / 2);
      stroke(200); // 淺灰色
      strokeWeight(2);
      noFill();
      circle(x247, y247, 20); // 247 外圈
    }

    if (keypoints[246]) {
      let p246 = keypoints[246];
      let x246 = map(p246[0], 0, video.width, -displayW / 2, displayW / 2);
      let y246 = map(p246[1], 0, video.height, -displayH / 2, displayH / 2);
      stroke(100); // 深灰色
      strokeWeight(2);
      noFill();
      circle(x246, y246, 8); // 246 內圈
    }
  }
}

// 輔助函式：使用純 line() 指令將陣列點位串聯起來
function drawLineSequence(keypoints, indices, isClosed) {
  for (let i = 0; i < indices.length - 1; i++) {
    let p1 = keypoints[indices[i]];
    let p2 = keypoints[indices[i + 1]];
    let x1 = map(p1[0], 0, video.width, -displayW / 2, displayW / 2);
    let y1 = map(p1[1], 0, video.height, -displayH / 2, displayH / 2);
    let x2 = map(p2[0], 0, video.width, -displayW / 2, displayW / 2);
    let y2 = map(p2[1], 0, video.height, -displayH / 2, displayH / 2);
    line(x1, y1, x2, y2);
  }
  
  // 如果需要頭尾相連
  if (isClosed) {
    let p1 = keypoints[indices[indices.length - 1]];
    let p2 = keypoints[indices[0]];
    let x1 = map(p1[0], 0, video.width, -displayW / 2, displayW / 2);
    let y1 = map(p1[1], 0, video.height, -displayH / 2, displayH / 2);
    let x2 = map(p2[0], 0, video.width, -displayW / 2, displayW / 2);
    let y2 = map(p2[1], 0, video.height, -displayH / 2, displayH / 2);
    line(x1, y1, x2, y2);
  }
}

function updateDisplaySize() {
  displayW = width * 0.5;
  displayH = height * 0.5;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDisplaySize();
}