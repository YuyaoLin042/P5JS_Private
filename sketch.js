// --- 全局变量 ---
let flowers = [];      // 存储所有花朵对象的数组
let vase;              // 花瓶对象
let currentFlowerType = 0; // 当前选择的花朵类型 (0: 郁金香, 1: 雏菊)

// --- Flower 类：代表一朵花 ---
class Flower {
  constructor(x, y, stemHeight, type) {
    this.x = x;                // 花朵的中心X坐标
    this.y = y;                // 花朵的中心Y坐标
    this.stemHeight = stemHeight; // 茎的高度
    this.type = type;          // 花朵类型
    this.stemColor = color(50, 150, 50); // 茎的颜色
    this.petalColor = this.type === 0 ? color(255, 100, 100) : color(255, 255, 150); // 花瓣颜色
    this.centerColor = this.type === 0 ? color(255, 200, 0) : color(255, 150, 0); // 花心颜色
  }

  // 绘制花朵
  display() {
    push();
    translate(this.x, this.y);
    
    // 1. 绘制花茎 (从花朵位置向下延伸)
    stroke(this.stemColor);
    strokeWeight(2);
    line(0, 0, 0, this.stemHeight);
    
    // 2. 绘制花朵
    noStroke();
    
    if (this.type === 0) {
      this.drawTulip(); // 绘制郁金香
    } else {
      this.drawDaisy(); // 绘制雏菊
    }
    
    pop();
  }

  // 绘制郁金香 (简单的曲线形状)
  drawTulip() {
    let size = 30;
    
    fill(this.petalColor);
    // 绘制主体
    beginShape();
    vertex(0, 0);
    bezierVertex(size/2, -size/3, size/2, -size, 0, -size);
    bezierVertex(-size/2, -size, -size/2, -size/3, 0, 0);
    endShape(CLOSE);
    
    // 绘制花心
    fill(this.centerColor);
    ellipse(0, 0, 10, 10);
  }
  
  // 绘制雏菊 (简单的重复花瓣)
  drawDaisy() {
    let petalSize = 25;
    let numPetals = 10;
    
    // 绘制花瓣
    fill(this.petalColor);
    for (let i = 0; i < numPetals; i++) {
      let angle = map(i, 0, numPetals, 0, TWO_PI);
      push();
      rotate(angle);
      ellipse(0, petalSize / 2, petalSize * 0.4, petalSize); // 花瓣
      pop();
    }
    
    // 绘制花心
    fill(this.centerColor);
    ellipse(0, 0, petalSize * 0.6, petalSize * 0.6);
  }
}

// --- Vase 类：代表花瓶 ---
class Vase {
  constructor(x, y, w, h) {
    this.x = x; // 花瓶底部中心X坐标
    this.y = y; // 花瓶底部Y坐标
    this.w = w; // 宽度
    this.h = h; // 高度
    this.color = color(150, 200, 250); // 蓝色花瓶
  }

  // 绘制花瓶
  display() {
    noStroke();
    fill(this.color);
    
    // 1. 绘制瓶身 (梯形)
    beginShape();
    vertex(this.x - this.w / 2, this.y); // 左下角
    vertex(this.x - this.w / 4, this.y - this.h); // 左上角
    vertex(this.x + this.w / 4, this.y - this.h); // 右上角
    vertex(this.x + this.w / 2, this.y); // 右下角
    endShape(CLOSE);
    
    // 2. 绘制瓶口 (稍微加深颜色，显得有厚度)
    fill(this.color, 150); // 瓶口
    ellipse(this.x, this.y - this.h, this.w / 4 * 2 + 5, 5); 
    
    // 3. 绘制花瓶中水面或插花泥的区域
    fill(100, 150, 100); 
    ellipse(this.x, this.y - this.h, this.w / 4 * 2, 5); 
  }

  // 检查一个点是否在花瓶插花区域 (瓶口) 内部
  isInside(px, py) {
    let topY = this.y - this.h;
    let topW = this.w / 2; 
    
    // 检查X坐标是否在瓶口宽度内，并且Y坐标是否在瓶口或其上方
    return (px > this.x - topW && px < this.x + topW && py < topY);
  }
}


// --- p5.js 基本函数 ---

function setup() {
  createCanvas(600, 700);
  
  // 初始化花瓶，位于画布底部中央
  let vaseWidth = 150;
  let vaseHeight = 250;
  vase = new Vase(width / 2, height - 50, vaseWidth, vaseHeight);
  
  // 创建UI提示
  let uiText = "点击鼠标左键：放置花朵 (当前类型: 郁金香)\n长按 'T' 键切换到 郁金香\n长按 'D' 键切换到 雏菊";
  alert(uiText);
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
  fill(50);
  textSize(16);
  
  let currentTypeText = currentFlowerType === 0 ? "郁金香" : "雏菊";
  text(`当前花朵类型: ${currentTypeText} (T: 郁金香, D: 雏菊)`, 20, 30);
  
  // 绘制一个预览花朵
  let preview = new Flower(width - 50, 50, 0, currentFlowerType);
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

// 键盘按下事件：切换花朵类型
function keyPressed() {
  if (key === 't' || key === 'T') {
    currentFlowerType = 0; // 切换到郁金香
  } else if (key === 'd' || key === 'D') {
    currentFlowerType = 1; // 切换到雏菊
  }
}

function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight);
  // 重新定位花瓶到新的画布中央
  vase.x = width / 2;
  vase.y = height - 50;
}
