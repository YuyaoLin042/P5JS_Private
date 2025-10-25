// --- 全局变量 ---
let flowers = [];      // 存储所有花朵对象的数组
let vase;              // 花瓶对象
let currentFlowerType = 0; // 当前选择的花朵类型 (0: 郁金香, 1: 雏菊, 2: 玫瑰, 3: 向日葵)

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
    else if (this.type === 3) this.drawSunflower(); // 新增向日葵
    
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

  // 优化后的玫瑰
  drawRose() {
    push();
    const petalCount = 12;
    const radius = 25;
    
    // 绘制外部花瓣（螺旋式层次）
    for (let i = 0; i < petalCount; i++) {
      const angle = map(i, 0, petalCount, 0, TWO_PI);
      
      // 颜色渐变 (模拟阴影)
      const baseColor = this.petalColor;
      // 使颜色随层数递进变深
      const r = red(baseColor)   - i * 5;
      const g = green(baseColor) - i * 5;
      const b = blue(baseColor)  - i * 5;
      fill(r, g, b);
      
      // 使用更像花瓣的形状
      push();
      rotate(angle + frameCount * 0.005); // 轻微动画
      
      // 花瓣主体
      beginShape();
      vertex(0, 0);
      bezierVertex(radius * 0.3, -radius * 0.5, radius * 0.3, -radius * 1.5, 0, -radius * 1.5);
      bezierVertex(-radius * 0.3, -radius * 1.5, -radius * 0.3, -radius * 0.5, 0, 0);
      endShape(CLOSE);
      
      pop();
    }
    
    // 绘制花心
    fill(this.centerColor);
    ellipse(0, 0, radius * 0.6, radius * 0.6);
    
    pop();
  }
  
  // 新增向日葵
  drawSunflower() {
    const petalSize = 35; // 花瓣长度
    const numPetals = 16; // 花瓣数量
    const centerSize = 25; // 花盘大小

    // 绘制花瓣
    fill(this.petalColor);
    for (let i = 0; i < numPetals; i++) {
      const angle = map(i, 0, numPetals, 0, TWO_PI);
      push();
      rotate(angle);
      // 向日葵花瓣形状更细长
      ellipse(0, petalSize * 0.5, petalSize * 0.3, petalSize);
      pop();
    }
    
    // 绘制花盘 (深棕色)
    fill(this.centerColor);
    ellipse(0, 0, centerSize, centerSize);
    
    // 绘制花盘的纹理（可选：用点或小圆）
    fill(100, 70, 0); // 略浅的棕色
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


// --- Vase 类：代表花瓶 (不变) ---
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

  // 检测鼠标是否靠近花朵
  highlightedFlowerIndex = -1;
  for (let i = flowers.length - 1; i >= 0; i--) {
    if (dist(mouseX, mouseY, flowers[i].x, flowers[i].y) <= DELETE_RADIUS) {
      highlightedFlowerIndex = i;
      break; // 只高亮最上面的一朵
    }
  }

  // 绘制高亮边框
  if (highlightedFlowerIndex !== -1) {
    noFill();
    stroke(30, 144, 255); // (Dodger Blue)
    strokeWeight(2.5);
    const f = flowers[highlightedFlowerIndex];
    circle(f.x, f.y, DELETE_RADIUS * 2);
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
  const flowerNames = ["郁金香", "雏菊", "玫瑰", "向日葵"];
  let flowerName = flowerNames[currentFlowerType];
  const type_keys = "(T: 郁金香, D: 雏菊, R: 玫瑰, S: 向日葵)";
  
  text(`当前花朵类型: ${flowerName}  (按键切换花朵类型 ${type_keys})`, marginX, marginY);

  text("点击鼠标左键放置花朵", marginX, marginY + 24);
  text("按X删除选中花朵, 按Backspace撤销上一朵", marginX, marginY + 48);

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
    // 茎应该从花朵中心(flowerX, flowerY)延伸到瓶口中心y（或略低于瓶口）
    // 为了美观和逻辑，让花茎延伸到瓶口底部的y坐标
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
  else if (key === 'r' || key === 'R') currentFlowerType = 2; // 玫瑰
  else if (key === 's' || key === 'S') currentFlowerType = 3; // 向日葵 (新增)

  // 删除高亮花朵
  if (key === 'x' || key === 'X') {
    if (highlightedFlowerIndex !== -1) {
      flowers.splice(highlightedFlowerIndex, 1);
      highlightedFlowerIndex = -1; // 删除后清空高亮
    }
  }

  // 撤销最后一朵
  if (key === 'Backspace') {
    if (flowers.length > 0) flowers.pop();
  }


}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 重新计算更大的花瓶尺寸
  let vaseWidth = min(windowWidth * 0.35, 280);
  let vaseHeight = min(windowHeight * 0.55, 420);

  vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight);
}
