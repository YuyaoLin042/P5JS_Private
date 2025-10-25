// --- 全局变量 ---
let flowers = [];      // 存储所有花朵对象的数组
let vase;              // 花瓶对象
let currentFlowerType = 0; // 当前选择的花朵类型 (0: 郁金香, 1: 雏菊, 2: 玫瑰, 3: 向日葵)
let currentVaseType = 0; // 当前选择的花瓶类型 (0: 梯形/经典, 1: 圆形/现代, 2: 曲线/复古)

let highlightedFlowerIndex = -1;
const DELETE_RADIUS = 28; // 鼠标与花中心小于这个距离就高亮


class Flower {
  constructor(x, y, stemHeight, type) {
    this.x = x;
    this.y = y;
    this.stemHeight = stemHeight;
    this.type = type; // 0: 郁金香, 1: 雏菊, 2: 玫瑰, 3: 向日葵

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
    } else if (this.type === 3) { // 向日葵
      this.petalColor  = color(255, 200, 0); // 亮黄
      this.centerColor = color(50, 50, 50);  // 深棕色花盘
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
    else if (this.type === 3) this.drawSunflower(); 
    
    pop();
  }

  // 郁金香 (不变)
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

  // 雏菊 (不变)
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

  // 优化后的玫瑰 v2.0：更像花苞的螺旋效果
  drawRose() {
    push();
    const numPetals = 8;
    const baseSize = 25;
    const layers = 5;

    // 花瓣绘制
    for (let j = layers; j >= 0; j--) {
      const currentSize = baseSize * (1 - j * 0.15);
      
      // 颜色渐变 (内深外浅)
      const baseColor = this.petalColor;
      const r = red(baseColor) - j * 15;
      const g = green(baseColor) + j * 5;
      const b = blue(baseColor) + j * 5;
      fill(r, g, b);

      // 螺旋效果
      for (let i = 0; i < numPetals; i++) {
        const angle = map(i, 0, numPetals, 0, TWO_PI);
        push();
        rotate(angle + j * PI/16); // 增加层间旋转
        
        // 绘制单个花瓣（使用贝塞尔曲线模拟褶皱）
        beginShape();
        vertex(0, 0);
        const cp1x = currentSize * 0.2;
        const cp1y = -currentSize * 0.5;
        const cp2x = currentSize * 0.4;
        const cp2y = -currentSize * 1.0;
        const tipx = 0;
        const tipy = -currentSize * 1.0;
        
        bezierVertex(cp1x, cp1y, cp2x, cp2y, tipx, tipy);
        
        const cp3x = -currentSize * 0.4;
        const cp3y = -currentSize * 1.0;
        const cp4x = -currentSize * 0.2;
        const cp4y = -currentSize * 0.5;
        
        bezierVertex(cp3x, cp3y, cp4x, cp4y, 0, 0);
        endShape(CLOSE);
        
        pop();
      }
    }
    
    // 绘制花心
    fill(this.centerColor);
    ellipse(0, 0, baseSize * 0.3, baseSize * 0.3);
    
    pop();
  }
  
  // 向日葵 (不变)
  drawSunflower() {
    const petalSize = 35; 
    const numPetals = 16;
    const centerSize = 25;

    // 绘制花瓣
    fill(this.petalColor);
    for (let i = 0; i < numPetals; i++) {
      const angle = map(i, 0, numPetals, 0, TWO_PI);
      push();
      rotate(angle);
      ellipse(0, petalSize * 0.5, petalSize * 0.3, petalSize);
      pop();
    }
    
    // 绘制花盘 (深棕色)
    fill(this.centerColor);
    ellipse(0, 0, centerSize, centerSize);
    
    // 绘制花盘的纹理
    fill(100, 70, 0); 
    const seedCount = 20;
    for (let i = 0; i < seedCount; i++) {
        const r = random(5, centerSize * 0.4);
        const a = random(TWO_PI);
        const x = cos(a) * r;
        const y = sin(a) * r;
        ellipse(x, y, 2, 2);
    }
  }
}


// --- Vase 类：支持多种形状 ---
class Vase {
  constructor(x, y, w, h, type) {
    this.bodyColor = color(150, 200, 250);
    this.mossColor = color(100, 150, 100);
    this.type = type; // 新增：花瓶类型
    this.set(x, y, w, h);
  }

  set(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    
    // 通用瓶口参数
    this.mouthCY = this.y - this.h;
    this.mouthW  = this.w * 0.5;
    this.mouthH  = max(6, this.h * 0.012);
    this.mouthA  = this.mouthW / 2;
    this.mouthB  = this.mouthH / 2;
    
    // 命中区域配置 (不变，使用通用区域)
    this.padX_ellipse  = max(12, this.w * 0.08); 
    this.padY_ellipse  = max(10, this.h * 0.05); 
    this.padY_above    = max(140, this.h * 0.70);
    this.padY_below    = max(24,  this.h * 0.10);
    this.padX_channel  = 6;
  }

  display() {
    noStroke();
    fill(this.bodyColor);

    if (this.type === 0) {
      // 形状 0: 梯形/经典 (原形状)
      beginShape();
      vertex(this.x - this.w / 2, this.y);
      vertex(this.x - this.w / 4, this.y - this.h);
      vertex(this.x + this.w / 4, this.y - this.h);
      vertex(this.x + this.w / 2, this.y);
      endShape(CLOSE);
    } else if (this.type === 1) {
      // 形状 1: 圆形/现代 (底部圆润，上部变细)
      const baseW = this.w * 0.7;
      const topW = this.w * 0.3;
      rect(this.x - topW/2, this.y - this.h, topW, this.h * 0.1);
      
      beginShape();
      vertex(this.x - topW/2, this.y - this.h);
      bezierVertex(this.x - baseW/2, this.y - this.h * 0.8,
                   this.x - baseW/2, this.y - this.h * 0.2,
                   this.x - baseW/2, this.y);
      arc(this.x, this.y, baseW, this.h * 0.2, 0, PI);
      vertex(this.x + baseW/2, this.y);
      bezierVertex(this.x + baseW/2, this.y - this.h * 0.2,
                   this.x + baseW/2, this.y - this.h * 0.8,
                   this.x + topW/2, this.y - this.h);
      endShape(CLOSE);
    } else if (this.type === 2) {
      // 形状 2: 曲线/复古 (中间收腰)
      const baseW = this.w * 0.6;
      const waistW = this.w * 0.4;
      const topW = this.w * 0.5;
      
      beginShape();
      // 底部
      vertex(this.x - baseW / 2, this.y);
      // 左侧曲线 (收腰)
      bezierVertex(this.x - baseW * 0.6, this.y - this.h * 0.3,
                   this.x - waistW / 2, this.y - this.h * 0.5,
                   this.x - topW / 2, this.y - this.h);
      // 顶部
      vertex(this.x + topW / 2, this.y - this.h);
      // 右侧曲线
      bezierVertex(this.x + waistW / 2, this.y - this.h * 0.5,
                   this.x + baseW * 0.6, this.y - this.h * 0.3,
                   this.x + baseW / 2, this.y);
      endShape(CLOSE);
    }

    // 瓶口 (所有类型都绘制瓶口)
    fill(red(this.bodyColor), green(this.bodyColor), blue(this.bodyColor), 180);
    ellipse(this.x, this.mouthCY, this.mouthW + 6, this.mouthH + 2);
    fill(this.mossColor);
    ellipse(this.x, this.mouthCY, this.mouthW, this.mouthH);
  }

  // 命中区域 (不变，只需要判断鼠标是否在瓶口上方)
  isInside(px, py) {
    const cx = this.x, cy = this.mouthCY;

    // 1) 瓶口附近“扩大椭圆”
    const a = this.mouthA + this.padX_ellipse;
    const b = this.mouthB + this.padY_ellipse;
    const dx = px - cx, dy = py - cy;
    const inExpandedEllipse = (dx*dx)/(a*a) + (dy*dy)/(b*b) <= 1;

    // 2) 上方竖向通道
    const left  = cx - (this.mouthA + this.padX_channel);
    const right = cx + (this.mouthA + this.padX_channel);
    const top   = cy - this.padY_above;
    const bottom= cy + this.padY_below;
    const inVerticalChannel = (px >= left && px <= right && py >= top && py <= bottom);

    // 3) 额外检查：是否点击在花瓶的身体上（用于切换花瓶类型）
    // 简化处理：如果点击在整个花瓶的矩形区域内（从瓶口到瓶底）
    const total_left = this.x - this.w/2;
    const total_right = this.x + this.w/2;
    const total_top = this.y - this.h - this.mouthH;
    const total_bottom = this.y;
    const onVaseBody = (px > total_left && px < total_right && py > total_top && py < total_bottom);

    // 不允许更低处（远离瓶口的瓶身）
    if (py > bottom && !onVaseBody) return false;

    // 如果在插花区域内，返回 true (可以插花)
    if (inExpandedEllipse || inVerticalChannel) return true;
    
    // 如果点击在花瓶身体上（且不在插花区域），返回 'VASE' 信号
    if (onVaseBody) return 'VASE';

    return false;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 初始化花瓶
  let vaseWidth = min(windowWidth * 0.35, 280);   
  let vaseHeight = min(windowHeight * 0.55, 420); 
  vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight, currentVaseType);
}



function draw() {
  background(250, 250, 240); 

  // 绘制花瓶
  vase.display();

  // 绘制所有花朵
  for (let i = flowers.length - 1; i >= 0; i--) {
    flowers[i].display();
  }

  // 检测鼠标是否靠近花朵
  highlightedFlowerIndex = -1;
  for (let i = flowers.length - 1; i >= 0; i--) {
    if (dist(mouseX, mouseY, flowers[i].x, flowers[i].y) <= DELETE_RADIUS) {
      highlightedFlowerIndex = i;
      break; 
    }
  }

  // 绘制高亮边框
  if (highlightedFlowerIndex !== -1) {
    noFill();
    stroke(30, 144, 255); 
    strokeWeight(2.5);
    const f = flowers[highlightedFlowerIndex];
    circle(f.x, f.y, DELETE_RADIUS * 2);
  }


  // 绘制提示文字
  drawUI();
}

function drawUI() {
  fill(50);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP); 

  const marginX = max(20, windowWidth * 0.02);
  const marginY = max(20, windowHeight * 0.02);

  const flowerNames = ["郁金香", "雏菊", "玫瑰", "向日葵"];
  let flowerName = flowerNames[currentFlowerType];
  const type_keys = "(T: 郁金香, D: 雏菊, R: 玫瑰, S: 向日葵)";
  
  text(`当前花朵类型: ${flowerName}  (按键切换花朵类型 ${type_keys})`, marginX, marginY);
  text("点击鼠标左键放置花朵", marginX, marginY + 24);
  text("按X删除选中花朵, 按Backspace撤销上一朵", marginX, marginY + 48);
  
  // 新增花瓶切换提示
  const vaseNames = ["经典梯形", "现代圆形", "复古曲线"];
  text(`当前花瓶类型: ${vaseNames[currentVaseType]} (点击花瓶切换形状)`, marginX, marginY + 72);

  // 预览花朵显示在右上角
  const previewX = windowWidth - marginX - 50;
  const previewY = marginY + 30;
  let preview = new Flower(previewX, previewY, 0, currentFlowerType);
  preview.display();
}


// 鼠标点击事件：在花瓶区域内放置花朵或切换花瓶
function mouseClicked() {
  const insideStatus = vase.isInside(mouseX, mouseY);

  if (insideStatus === true) {
    // 状态为 true，表示在插花区域内
    let flowerX = mouseX;
    let flowerY = mouseY;
    let stemLen = vase.y - vase.h - flowerY; 
    
    let newFlower = new Flower(flowerX, flowerY, stemLen, currentFlowerType);
    flowers.push(newFlower);
    
  } else if (insideStatus === 'VASE') {
    // 状态为 'VASE'，表示点击在花瓶主体上，切换花瓶类型
    currentVaseType = (currentVaseType + 1) % 3;
    
    // 重新创建花瓶对象以应用新类型
    let vaseWidth = min(windowWidth * 0.35, 280);   
    let vaseHeight = min(windowHeight * 0.55, 420); 
    vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight, currentVaseType);
  }
}

function keyPressed() {
  if (key === 't' || key === 'T') currentFlowerType = 0; 
  else if (key === 'd' || key === 'D') currentFlowerType = 1; 
  else if (key === 'r' || key === 'R') currentFlowerType = 2; 
  else if (key === 's' || key === 'S') currentFlowerType = 3; 

  if (key === 'x' || key === 'X') {
    if (highlightedFlowerIndex !== -1) {
      flowers.splice(highlightedFlowerIndex, 1);
      highlightedFlowerIndex = -1; 
    }
  }

  if (key === 'Backspace') {
    if (flowers.length > 0) flowers.pop();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 重新计算花瓶尺寸并保持当前类型
  let vaseWidth = min(windowWidth * 0.35, 280);
  let vaseHeight = min(windowHeight * 0.55, 420);

  vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight, currentVaseType);
}
