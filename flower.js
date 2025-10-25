let flowers = [];      // 存储所有花朵对象的数组
let vase;              // 花瓶对象
let currentFlowerType = 0; // 当前选择的花朵类型 (0: 郁金香, 1: 雏菊, 2: 玫瑰, 3: 向日葵)
let currentVaseType = 0; // 当前选择的花瓶类型 (0: 梯形/经典, 1: 圆形/现代, 2: 曲线/复古)
let currentVaseType = 0; // 当前选择的花瓶类型 (0: 经典, 1: 现代, 2: 复古)

let highlightedFlowerIndex = -1;
const DELETE_RADIUS = 28; // 鼠标与花中心小于这个距离就高亮


// Flower 类保持不变，因为它不是本次优化的重点

class Flower {
constructor(x, y, stemHeight, type) {
this.x = x;
@@ -81,7 +83,7 @@ class Flower {
ellipse(0, 0, petalSize * 0.6, petalSize * 0.6);
}

  // 优化后的玫瑰 v2.0：更像花苞的螺旋效果
  // 优化后的玫瑰 v2.0
drawRose() {
push();
const numPetals = 8;
@@ -170,26 +172,25 @@ class Flower {
}


// --- Vase 类：支持多种形状 ---
// --- Vase 类：支持多种形状，瓶口对齐优化 ---
class Vase {
constructor(x, y, w, h, type) {
this.bodyColor = color(150, 200, 250);
this.mossColor = color(100, 150, 100);
    this.type = type; // 新增：花瓶类型
    this.type = type; 
this.set(x, y, w, h);
}

set(x, y, w, h) {
this.x = x; this.y = y; this.w = w; this.h = h;

    // 通用瓶口参数
    // 瓶口中心Y和高度不变
this.mouthCY = this.y - this.h;
    this.mouthW  = this.w * 0.5;
this.mouthH  = max(6, this.h * 0.012);
    this.mouthA  = this.mouthW / 2;
    this.mouthB  = this.mouthH / 2;

    // 命中区域配置 (不变，使用通用区域)
    // 瓶口宽度需要在 display() 中根据当前类型计算

    // 命中区域配置 (不变)
this.padX_ellipse  = max(12, this.w * 0.08); 
this.padY_ellipse  = max(10, this.h * 0.05); 
this.padY_above    = max(140, this.h * 0.70);
@@ -200,62 +201,90 @@ class Vase {
display() {
noStroke();
fill(this.bodyColor);
    
    let topWidth = 0;

if (this.type === 0) {
      // 形状 0: 梯形/经典 (原形状)
      // 形状 0: 经典梯形/直筒 (更细长的梯形)
      topWidth = this.w * 0.4; // 瓶身顶部宽度
      const baseW = this.w * 0.6; // 瓶身底部宽度
      
beginShape();
      vertex(this.x - this.w / 2, this.y);
      vertex(this.x - this.w / 4, this.y - this.h);
      vertex(this.x + this.w / 4, this.y - this.h);
      vertex(this.x + this.w / 2, this.y);
      vertex(this.x - baseW / 2, this.y);
      vertex(this.x - topWidth / 2, this.y - this.h);
      vertex(this.x + topWidth / 2, this.y - this.h);
      vertex(this.x + baseW / 2, this.y);
endShape(CLOSE);
      
} else if (this.type === 1) {
      // 形状 1: 圆形/现代 (底部圆润，上部变细)
      const baseW = this.w * 0.7;
      const topW = this.w * 0.3;
      rect(this.x - topW/2, this.y - this.h, topW, this.h * 0.1);
      // 形状 1: 现代圆形 (更优美的卵形)
      topWidth = this.w * 0.3; 
      const maxW = this.w * 0.7; // 最大宽度

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
      // 左侧曲线
      vertex(this.x - topWidth / 2, this.y - this.h);
      bezierVertex(this.x - maxW / 2, this.y - this.h * 0.9,
                   this.x - maxW / 2, this.y - this.h * 0.3,
                   this.x - maxW / 2, this.y);
      
      // 底部弧线 (为了简化，用弧线连接)
      arc(this.x, this.y, maxW, this.h * 0.15, 0, PI);
      
      // 右侧曲线
      vertex(this.x + maxW / 2, this.y);
      bezierVertex(this.x + maxW / 2, this.y - this.h * 0.3,
                   this.x + maxW / 2, this.y - this.h * 0.9,
                   this.x + topWidth / 2, this.y - this.h);
endShape(CLOSE);

} else if (this.type === 2) {
      // 形状 2: 曲线/复古 (中间收腰)
      const baseW = this.w * 0.6;
      const waistW = this.w * 0.4;
      const topW = this.w * 0.5;
      // 形状 2: 复古曲线 (S形/收腰)
      topWidth = this.w * 0.45; // 瓶口宽度
      const baseW = this.w * 0.5; // 底部宽度
      const waistW = this.w * 0.35; // 收腰处的宽度

beginShape();
// 底部
vertex(this.x - baseW / 2, this.y);
      // 左侧曲线 (收腰)
      // 左侧曲线 (底部到腰)
bezierVertex(this.x - baseW * 0.6, this.y - this.h * 0.3,
this.x - waistW / 2, this.y - this.h * 0.5,
                   this.x - topW / 2, this.y - this.h);
                   this.x - waistW / 2, this.y - this.h * 0.7);
      // 左侧曲线 (腰到顶)
      bezierVertex(this.x - waistW / 2, this.y - this.h * 0.8,
                   this.x - topWidth / 2, this.y - this.h * 0.9,
                   this.x - topWidth / 2, this.y - this.h);
      
// 顶部
      vertex(this.x + topW / 2, this.y - this.h);
      // 右侧曲线
      vertex(this.x + topWidth / 2, this.y - this.h);
      
      // 右侧曲线 (顶到腰)
      bezierVertex(this.x + topWidth / 2, this.y - this.h * 0.9,
                   this.x + waistW / 2, this.y - this.h * 0.8,
                   this.x + waistW / 2, this.y - this.h * 0.7);
      // 右侧曲线 (腰到底)
bezierVertex(this.x + waistW / 2, this.y - this.h * 0.5,
this.x + baseW * 0.6, this.y - this.h * 0.3,
this.x + baseW / 2, this.y);
endShape(CLOSE);
}
    
    // --- 瓶口绘制 ---
    // 使用瓶身顶部宽度作为瓶口宽度
    this.mouthW = topWidth;
    this.mouthA = this.mouthW / 2; // 更新半轴

    // 瓶口 (所有类型都绘制瓶口)
    // 瓶口外圈
fill(red(this.bodyColor), green(this.bodyColor), blue(this.bodyColor), 180);
ellipse(this.x, this.mouthCY, this.mouthW + 6, this.mouthH + 2);
    
    // 瓶口内圈（苔藓/水面）
fill(this.mossColor);
ellipse(this.x, this.mouthCY, this.mouthW, this.mouthH);
}

  // 命中区域 (不变，只需要判断鼠标是否在瓶口上方)
  // 命中区域 (不变，但使用更新后的 this.mouthA 计算)
isInside(px, py) {
const cx = this.x, cy = this.mouthCY;

@@ -273,9 +302,9 @@ class Vase {
const inVerticalChannel = (px >= left && px <= right && py >= top && py <= bottom);

// 3) 额外检查：是否点击在花瓶的身体上（用于切换花瓶类型）
    // 简化处理：如果点击在整个花瓶的矩形区域内（从瓶口到瓶底）
    const total_left = this.x - this.w/2;
    const total_right = this.x + this.w/2;
    // 简化处理：检查是否在整个花瓶的最大宽度和高度范围内
    const total_left = this.x - this.w * 0.7 / 2; // 略微放宽
    const total_right = this.x + this.w * 0.7 / 2;
const total_top = this.y - this.h - this.mouthH;
const total_bottom = this.y;
const onVaseBody = (px > total_left && px < total_right && py > total_top && py < total_bottom);
@@ -293,6 +322,10 @@ class Vase {
}
}

// -------------------------------------------------------------
// 以下为 p5.js 框架函数，逻辑与上一个版本基本一致
// -------------------------------------------------------------

function setup() {
createCanvas(windowWidth, windowHeight);
