let video;
let facemesh;
let predictions = [];
let displayW, displayH;

// 指定要連線的臉部節點編號
const pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function setup() {
  // 1. 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 計算影像顯示尺寸 (畫布寬高的 50%)
  updateDisplaySize();

  // 2. 設定攝影機
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // 隱藏原始 HTML 標籤，只顯示在畫布上

  // 3. 初始化 Facemesh
  facemesh = ml5.facemesh(video, () => console.log("模型準備完畢！"));
  
  // 當偵測到臉部時，將結果存入 predictions 變數
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  // 4. 設定背景顏色
  background('#e7c6ff');

  // 5. 在影像上方顯示文字 (置中於畫布)
  noStroke();
  fill(0); // 文字顏色設為黑色
  textSize(windowHeight * 0.04); // 動態調整字體大小
  textAlign(CENTER, CENTER);
  // 將文字放在畫布中間偏上的位置
  text("教科123456789", width / 2, height * 0.15);

  // 6. 影像與辨識線條處理
  push();
  // 位移到畫布中間，並處理左右顛倒 (Mirror)
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  // 繪製影像 (置中、50% 尺寸)
  imageMode(CENTER);
  image(video, 0, 0, displayW, displayH);

  // 7. 繪製連線
  drawFacemeshLines();
  pop();
}

function drawFacemeshLines() {
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;

    stroke(255, 0, 0);       // 紅色線條
    strokeWeight(15);        // 粗細為 15
    noFill();

    beginShape();
    for (let i = 0; i < pointIndices.length; i++) {
      let index = pointIndices[i];
      let p = keypoints[index];

      // 將原始影像座標映射到縮放後的影像尺寸上
      let x = map(p[0], 0, video.width, -displayW / 2, displayW / 2);
      let y = map(p[1], 0, video.height, -displayH / 2, displayH / 2);
      
      vertex(x, y);
    }
    endShape();
  }
}

// 輔助函式：計算顯示尺寸
function updateDisplaySize() {
  displayW = width * 0.5;
  displayH = height * 0.5;
}

// 視窗調整大小時自動適應
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateDisplaySize();
}