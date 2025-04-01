# 希腊叠塔游戏 - 判定系统设计

## 系统概述

判定系统是游戏的核心机制之一，负责评估玩家的堆叠精确度并提供相应的反馈和奖励。新的判定系统将引入双级判定和连击奖励机制，提升游戏的技巧性和趣味性。

## 实现步骤

### 第一阶段：基础判定系统

#### 1. 判定等级
- **完美 (Perfect)**
  - 误差范围：≤1%
  - 特点：自动对齐
  - 视觉反馈：金色光效
  - 音效：清脆的完美音效

- **一般 (Good)**
  - 误差范围：1-2%
  - 特点：保持当前位置
  - 视觉反馈：普通光效
  - 音效：标准堆叠音效

#### 2. 判定逻辑
```javascript
function checkAlignment(currentBlock, previousBlock) {
    // 计算重叠度
    const overlap = calculateOverlap(currentBlock, previousBlock);
    const perfectThreshold = 0.99; // 99%重叠度为完美
    const goodThreshold = 0.98;    // 98%重叠度为一般
    
    // 判定等级
    if (overlap >= perfectThreshold) {
        autoAlign(currentBlock, previousBlock); // 自动对齐
        return 'perfect';
    } else if (overlap >= goodThreshold) {
        return 'good';
    }
    return 'miss';
}
```

#### 3. 自动对齐机制
- 触发条件：达到完美判定（误差≤1%）
- 对齐方式：将当前方块完全对齐到下方方块
- 实现方法：调整方块的axis位置到理想位置

### 第二阶段：Combo系统

#### 1. Combo计数规则
- 初始倍率：x1
- 3连Perfect：倍率提升至x2
- 10连Perfect：倍率提升至x3
- Miss或Good：重置combo计数

#### 2. 分数计算
```javascript
class ComboSystem {
    constructor() {
        this.comboCount = 0;
        this.multiplier = 1;
    }

    updateCombo(judgement) {
        if (judgement === 'perfect') {
            this.comboCount++;
            // 更新倍率
            if (this.comboCount >= 10) {
                this.multiplier = 3;
            } else if (this.comboCount >= 3) {
                this.multiplier = 2;
            }
        } else {
            // 重置combo
            this.comboCount = 0;
            this.multiplier = 1;
        }
    }

    calculateScore(baseScore) {
        return baseScore * this.multiplier;
    }
}
```

#### 3. 显示效果
- Combo计数器：显示当前连击数
- 倍率显示：当前分数倍率
- 动态效果：连击数增加时的动画效果

## 技术实现

### 1. 核心判定函数
```javascript
function calculateOverlap(currentBlock, previousBlock) {
    const { axis } = currentBlock.getAxis();
    const distance = Math.abs(currentBlock.position[axis] - previousBlock.position[axis]);
    const blockSize = currentBlock.dimension[axis === 'x' ? 'width' : 'depth'];
    
    return 1 - (distance / blockSize);
}
```

### 2. 自动对齐实现
```javascript
function autoAlign(currentBlock, previousBlock) {
    const { axis } = currentBlock.getAxis();
    currentBlock.position[axis] = previousBlock.position[axis];
    currentBlock.mesh.position[axis] = currentBlock.position[axis];
}
```

## 调试与平衡

### 1. 判定参数
- 完美判定：1%误差（可调整范围：0.5-1.5%）
- 一般判定：2%误差（可调整范围：1.5-2.5%）
- 自动对齐触发阈值：1%

### 2. Combo参数
- 倍率提升门槛：3连/10连（可调整）
- 倍率数值：x2/x3（可调整）
- 重置条件：任何非Perfect判定

## 后续优化方向

### 1. 视觉反馈增强
- 添加粒子效果
- 优化光效表现
- 加入屏幕震动

### 2. 音效系统
- 完善判定音效
- 添加combo音效
- 实现动态音效调整

### 3. 平衡性调整
- 根据玩家反馈调整判定范围
- 优化combo系统参数
- 完善奖励机制

## 开发计划

### 第一阶段（预计2天）
1. 实现基础判定逻辑
2. 添加自动对齐机制
3. 基础视觉反馈

### 第二阶段（预计2天）
1. 实现Combo系统
2. 添加UI显示
3. 完善反馈效果

### 测试阶段（预计1天）
1. 判定准确性测试
2. 手感测试与调整
3. 分数平衡性测试 