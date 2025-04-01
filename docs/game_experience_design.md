# 游戏体验设计文档

## 核心机制分析与优化

### 1. 移动系统 (Movement System)

#### 当前实现
```javascript
// block.js
tick(speed=0) {
    let value = this.position[this.axis];
    if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) {
      this.reverseDirection();
    }
    this.position[this.axis] += this.direction + (this.direction * speed);
    this.mesh.position[this.axis] = this.position[this.axis];
}
```

#### 存在问题
- 移动速度随层数线性增加，不符合游戏体验需求
- 移动范围固定（MOVE_AMOUNT = 12）
- 缺乏速度缓冲机制
- 缺乏打击感反馈

#### 优化方案
1. **渐进式减速系统**
   - 引入微小的减速曲线
   - 设置最低速度限制
   - 保持游戏难度的平滑过渡

2. **动态移动范围**
   - 根据高度动态调整移动范围
   - 保持基础移动范围的稳定性

### 2. 堆叠判定系统 (Stacking System)

#### 当前实现
- 简单的位置重叠判定
- 无容错机制
- 缺乏视觉反馈

#### 优化方案
1. **判定机制优化**
   - 添加小幅度自动对齐（误差±2%内）
   - 引入双级判定（完美/一般）
   - 连续完美奖励机制

2. **视觉反馈**
   - 堆叠成功特效
   - 完美堆叠光效

### 3. 反馈系统 (Feedback System)

#### 当前实现
```javascript
// FallingBlock类
tick() {
    let value = this.position.y;
    this.position.y -= Math.abs(this.direction);
    this.mesh.rotation.z += this.direction/6;
    this.mesh.position.y = this.position.y;
}
```

#### 动画效果设计（优先级排序）

1. **震屏效果（第一优先级）**
   - 触发条件：Perfect判定时
   - 效果描述：
     - 整个画面的轻微晃动，以横向为主
     - 震动持续时间：0.2-0.3秒
     - 震幅：小而快，给人"咔"的感觉
   - 技术实现：
     ```javascript
     function screenShake() {
         const intensity = 0.5;  // 震动强度
         const duration = 250;   // 持续时间（毫秒）
         const frequency = 20;   // 震动频率
     }
     ```

2. **光效扩散（第二优先级）**
   - 触发条件：Perfect判定时
   - 效果描述：
     - 从方块接触点扩散出金色光环
     - 类似涟漪的效果，快速扩散后消失
     - 可叠加多个光环制造层次感
   - 视觉参考：
     - 颜色：金色 (#FFD700)
     - 扩散时间：0.3-0.4秒
     - 透明度：100% -> 0%渐变

3. **方块特效（第三优先级）**
   - Perfect时：
     - 对齐瞬间的白色闪光
     - 完美对齐的两个方块短暂发光
     - 发光持续时间：0.5秒
   - Good时：
     - 较弱的发光效果
     - 持续时间：0.3秒

4. **装饰性效果（后续考虑）**
   - 希腊风格图案环绕
   - 几何线条动画
   - 背景明暗变化

#### 实现优先级
1. 第一阶段：震屏效果
   - 基础震动系统
   - 震动参数调优
   - 与判定系统联动

2. 第二阶段：光效系统
   - 扩散光环效果
   - 方块发光效果
   - 性能优化

3. 第三阶段：额外装饰
   - 希腊风格元素
   - 组合动画效果
   - 最终优化调整

#### 优化方案
1. **视觉反馈**
   - 方块状态指示器
   - 堆叠结果特效
   - 屏幕震动效果
   - 高度里程碑效果

2. **音频反馈**
   - 移动音效
   - 堆叠音效（分级）
   - 失败音效
   - 背景音乐动态调整


2. **奖励机制**
   - 连续成功加分
   - 完美堆叠特殊奖励
   - 高度里程碑奖励

## 实施计划

### 第一阶段：基础体验优化
1. 重新设计速度系统
   - 实现渐进式减速
   - 添加速度缓冲机制
   - 优化移动范围

2. 改进堆叠判定
   - 实现2%误差的自动对齐
   - 添加双级判定
   - 基础视觉反馈

### 第二阶段：反馈系统增强
1. 视觉反馈
   - 实现屏幕震动
   - 添加特效系统
   - 优化UI显示

2. 音频系统
   - 实现基础音效
   - 添加动态音乐
   - 音效分级系统

### 第三阶段：高级特性
1. 完美堆叠系统
   - 实现判定机制
   - 添加特殊效果
   - 设计奖励机制

2. 难度平衡
   - 实现动态难度
   - 优化难度曲线
   - 添加奖励系统

## 技术实现参考

### 速度计算公式
```javascript
// 建议的渐进式减速计算
function calculateSpeed(level) {
    const baseSpeed = config.block.initSpeed;
    const minSpeed = config.block.minSpeed;
    const decelerationFactor = 0.98; // 每层减少2%的速度
    
    // 计算当前层级的速度
    let speed = baseSpeed * Math.pow(decelerationFactor, level);
    
    // 确保速度不会低于最小值
    return Math.max(speed, minSpeed);
}
```

### 判定系统示例
```javascript
function checkAlignment(currentBlock, previousBlock) {
    const overlap = calculateOverlap(currentBlock, previousBlock);
    const perfectThreshold = 0.98; // 98%重叠度为完美
    
    if (overlap >= perfectThreshold) return 'perfect';
    return 'good';
}
``` 