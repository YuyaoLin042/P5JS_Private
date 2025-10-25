// --- 全局变量 ---
let flowers = [];      // 存储所有花朵对象的数组
let vase;              // 花瓶对象
let currentFlowerType = 0; // 当前选择的花朵类型 (0: 郁金香, 1: 雏菊)

class Flower {
  constructor(x, y, stemHeight, type) {
    this.x = x;
    this.y = y;
    this.stemHeight = stemHeight;
    this.type = type; // 0: 郁金香, 1: 雏菊, 2: 玫瑰

    this.stemColor   = color(50, 150, 50);

    // 按类型设定颜色
    if (this.type === 0) { // 郁金香
      this.petalColor  = color(255, 100, 100);
      this.centerColor = color(255, 200, 0);
    } else if (this.type === 1) { // 雏菊
      this.petalColor  = color(255, 255, 150);
      this.centerColor = color(255, 150, 0);
    } else if (this.type === 2) { // 玫瑰
      this.petalColor  = color(220, 0, 70);  // 深红
      this.centerColor = color(150, 0, 30);
    }
  }

  display() {
    push();
    translate(this.x, this.y);

    // 花茎
    stroke(this.stemColor);
    strokeWeight(2);
    line(0, 0, 0, this.stemHeight);

    // 花朵
    noStroke();
    if (this.type === 0) this.drawTulip();
    else if (this.type === 1) this.drawDaisy();
    else if (this.type === 2) this.drawRose();

    pop();
  }

  // 郁金香
  drawTulip() {
    const size = 30;
    fill(this.petalColor);
    beginShape();
    vertex(0, 0);
    bezierVertex(size/2, -size/3, size/2, -size, 0, -size);
    bezierVertex(-size/2, -size, -size/2, -size/3, 0, 0);
    endShape(CLOSE);
    fill(this.centerColor);
    ellipse(0, 0, 10, 10);
  }

  // 雏菊
  drawDaisy() {
    const petalSize = 25;
    const numPetals = 10;
    fill(this.petalColor);
    for (let i = 0; i < numPetals; i++) {
      const angle = map(i, 0, numPetals, 0, TWO_PI);
      push();
      rotate(angle);
      ellipse(0, petalSize / 2, petalSize * 0.4, petalSize);
      pop();
    }
    fill(this.centerColor);
    ellipse(0, 0, petalSize * 0.6, petalSize * 0.6);
  }

  // 玫瑰
  drawRose() {
    push();
    const layers = 6;       // 花瓣层数
    const baseSize = 20;    // 最内层大小
    noStroke();
    for (let i = 0; i < layers; i++) {
      const size = baseSize + i * 6;
      fill(this.petalColor.levels[0], this.petalColor.levels[1] - i * 10, this.petalColor.levels[2] - i * 10);
      beginShape();
      for (let a = 0; a < TWO_PI; a += PI / 8) {
        const r = size + sin(a * 3 + frameCount * 0.02) * 2; // 花瓣波动
        const x = cos(a) * r * 0.6;
        const y = sin(a) * r * 0.6;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
    // 花心
    fill(this.centerColor);
    ellipse(0, 0, 10, 10);
    pop();
  }
}


// --- Vase 类：代表花瓶 ---
class Vase {
  constructor(x, y, w, h) {
    this.bodyColor = color(150, 200, 250);
    this.mossColor = color(100, 150, 100);
    this.set(x, y, w, h);
  }

  set(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;

    // —— 与 display() 一致的瓶口参数 —— //
    this.mouthCY = this.y - this.h;    // 瓶口中心Y
    this.mouthW  = this.w * 0.5;       // 显示时瓶口总宽
    this.mouthH  = max(6, this.h * 0.012); // 显示时瓶口总高
    this.mouthA  = this.mouthW / 2;    // 瓶口水平半轴
    this.mouthB  = this.mouthH / 2;    // 瓶口垂直半轴

    // 命中区域配置
    this.padX_ellipse  = max(12, this.w * 0.08);   // 椭圆横向放宽
    this.padY_ellipse  = max(10, this.h * 0.05);   // 椭圆纵向放宽
    this.padY_above    = max(140, this.h * 0.70);  // 上方通道高度
    this.padY_below    = max(24,  this.h * 0.10);  // 下方容差
    this.padX_channel  = 6;                        // 通道横向容差（小）
  }

  display() {
    noStroke();
    fill(this.bodyColor);
    beginShape();
    vertex(this.x - this.w / 2, this.y);
    vertex(this.x - this.w / 4, this.y - this.h);
    vertex(this.x + this.w / 4, this.y - this.h);
    vertex(this.x + this.w / 2, this.y);
    endShape(CLOSE);

    // 瓶口
    fill(red(this.bodyColor), green(this.bodyColor), blue(this.bodyColor), 180);
    ellipse(this.x, this.mouthCY, this.mouthW + 6, this.mouthH + 2);
    fill(this.mossColor);
    ellipse(this.x, this.mouthCY, this.mouthW, this.mouthH);
  }

  // —— 修正后的命中：扩大椭圆 ∪ 上方通道（横向以 mouthA 为准） —— //
  isInside(px, py) {
    const cx = this.x, cy = this.mouthCY;

    // 1) 瓶口附近“扩大椭圆”（好点中）
    const a = this.mouthA + this.padX_ellipse;
    const b = this.mouthB + this.padY_ellipse;
    const dx = px - cx, dy = py - cy;
    const inExpandedEllipse = (dx*dx)/(a*a) + (dy*dy)/(b*b) <= 1;

    // 2) 上方竖向通道（横向严格用 mouthA + 小容差）
    const left  = cx - (this.mouthA + this.padX_channel);
    const right = cx + (this.mouthA + this.padX_channel);
    const top   = cy - this.padY_above;
    const bottom= cy + this.padY_below;
    const inVerticalChannel = (px >= left && px <= right && py >= top && py <= bottom);

    // 不允许更低处（远离瓶口的瓶身）
    if (py > bottom) return false;

    return inExpandedEllipse || inVerticalChannel;
  }
}

function setup() {
  // 画布全屏铺满
  createCanvas(windowWidth, windowHeight);

  // 花瓶尺寸：更大、更突出
  let vaseWidth = min(windowWidth * 0.35, 280);   // 占宽度 35%，最大 280
  let vaseHeight = min(windowHeight * 0.55, 420); // 占高度 55%，最大 420

  // 花瓶居中靠底
  vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight);
}



function draw() {
  background(250, 250, 240); // 浅色背景

  // 绘制花瓶
  vase.display();

  // 绘制所有花朵
  // 倒序绘制，让后插入的花朵显示在前面
  for (let i = flowers.length - 1; i >= 0; i--) {
    flowers[i].display();
  }
  // 绘制提示文字
  drawUI();
}

function drawUI() {
  // 统一样式
  fill(50);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP); // 左对齐 + 顶对齐

  // 动态边距（相对屏幕大小）
  const marginX = max(20, windowWidth * 0.02);
  const marginY = max(20, windowHeight * 0.02);

  // 文本内容
  let currentTypeText = currentFlowerType === 0 ? "郁金香" : "雏菊";
  let flowerName = ["郁金香", "雏菊", "玫瑰"][currentFlowerType];
  text(`当前花朵类型: ${flowerName}  (T: 郁金香, D: 雏菊, R: 玫瑰)`, marginX, marginY);

  // text(`当前花朵类型: ${currentTypeText}  (T: 郁金香, D: 雏菊)`, marginX, marginY);
  text("点击鼠标左键放置花朵", marginX, marginY + 24);
  text("按键切换花朵类型", marginX, marginY + 48);

  // 预览花朵显示在右上角（自适应）
  const previewX = windowWidth - marginX - 50;
  const previewY = marginY + 30;
  let preview = new Flower(previewX, previewY, 0, currentFlowerType);
  preview.display();
}


// 鼠标点击事件：在花瓶区域内放置一朵花
function mouseClicked() {
  // 只有在鼠标点击在花瓶的插花区域内时才放置
  if (vase.isInside(mouseX, mouseY)) {
    // 花朵的中心 (x, y) 就是鼠标点击的位置
    let flowerX = mouseX;
    let flowerY = mouseY;
    
    // 茎长 = 鼠标Y坐标 - 瓶口Y坐标 (这样茎就能插到花瓶底部)
    let stemLen = vase.y - vase.h - flowerY; 
    
    // 创建新的花朵对象
    let newFlower = new Flower(flowerX, flowerY, stemLen, currentFlowerType);
    
    // 将新花朵添加到数组中
    flowers.push(newFlower);
  }
}

function keyPressed() {
  if (key === 't' || key === 'T') currentFlowerType = 0; // 郁金香
  else if (key === 'd' || key === 'D') currentFlowerType = 1; // 雏菊
  else if (key === 'r' || key === 'R') currentFlowerType = 2; // 🌹玫瑰
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 重新计算更大的花瓶尺寸
  let vaseWidth = min(windowWidth * 0.35, 280);
  let vaseHeight = min(windowHeight * 0.55, 420);

  vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight);
}


