let video;
let facemesh;
let predictions = [];
let displayW, displayH;

// 定義需要連線的特徵點編號
const pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function setup() {
  // 1. 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定影像顯示尺寸為畫布寬高的 50%
  displayW = width * 0.5;
  displayH = height * 0.5;

  // 2. 初始化攝影機
  video = createCapture(VIDEO);
  video.size(640, 480); // 這是內部辨識用的解析度
  video.hide();         // 隱藏原始影像，我們要在畫布上自訂繪製

  // 3. 初始化 Facemesh 辨識
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("Model Ready!");
}

function draw() {
  // 4. 設定背景顏色
  background('#e7c6ff');

  // 5. 在影像上方顯示文字
  fill(0);                // 文字顏色 (黑色)
  textSize(32);
  textAlign(CENTER, CENTER);
  // 位置置中於畫布，高度設在影像上方 (約為畫布高度的 15%)
  text("教科123456789", width / 2, height * 0.15);

  // 6. 處理影像顯示 (置中、50% 尺寸、左右顛倒)
  push();
  // 先位移到畫布中間
  translate(width / 2, height / 2);
  // 執行水平翻轉 (左右顛倒)
  scale(-1, 1);
  
  // 繪製影像 (使用影像模式 CENTER，讓 (0,0) 為影像中心點)
  imageMode(CENTER);
  image(video, 0, 0, displayW, displayH);

  // 7. 臉部辨識連線處理
  drawLines();
  
  pop();
}

function drawLines() {
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;

    stroke(255, 0, 0);       // 設定線條顏色為紅色
    strokeWeight(15);        // 設定線條粗細為 15
    noFill();

    beginShape();
    for (let i = 0; i < pointIndices.length; i++) {
      let index = pointIndices[i];
      let p = keypoints[index];

      // 將原始影像座標映射到畫布上的 50% 尺寸
      // 由於我們在 draw() 已經 translate 到畫布中心，且使用了 scale(-1, 1)
      // 這裡只需要將座標按比例轉換即可 (相對中心點的偏移)
      let x = map(p[0], 0, video.width, -displayW / 2, displayW / 2);
      let y = map(p[1], 0, video.height, -displayH / 2, displayH / 2);
      
      vertex(x, y);
    }
    // 若要將最後一點連回第一點形成封閉線條，可取消下面註解：
    // endShape(CLOSE); 
    endShape();
  }
}

// 視窗大小改變時，重新調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  displayW = width * 0.5;
  displayH = height * 0.5;
}