# 希腊叠塔游戏 - Oracle预言系统设计

本文档详细说明希腊叠塔游戏中Oracle预言系统的设计、实现和集成方案，帮助开发团队了解如何将这一特色功能添加到游戏中。

## 系统概述

Oracle预言系统是希腊叠塔游戏的特色功能，模拟古希腊德尔斐神谕(Oracle at Delphi)向玩家传递神秘预言的体验。该系统在游戏过程中的关键时刻（特定层数或特殊事件）向玩家展示预言文本，增强游戏的沉浸感和神秘氛围。

## 核心功能

- 在特定游戏层数或事件触发预言文本
- 根据游戏状态动态选择合适的预言内容
- 提供视觉和音频效果增强预言体验
- 为游戏增添叙事深度和希腊文化元素

## 系统架构

### 类结构

```javascript
class Oracle {
  constructor(game) {
    this.game = game;              // 游戏实例引用
    this.messageElement = null;    // DOM元素，用于显示预言
    this.audioEffects = {};        // 预言音效
    this.isDisplaying = false;     // 当前是否正在显示预言
    this.messageQueue = [];        // 预言消息队列
    this.specialMessages = {};     // 特定关卡的专用预言
    this.randomMessages = [];      // 随机预言池
    this.perfectMessages = [];     // 完美叠放预言池
    this.endingMessages = {};      // 结束场景预言
    
    this.initialize();
  }
  
  // 方法定义...
}
```

### 主要方法

```javascript
// 初始化Oracle系统
initialize() {
  // 创建DOM元素
  this.messageElement = document.createElement('div');
  this.messageElement.className = 'oracle-message';
  document.getElementById('container').appendChild(this.messageElement);
  
  // 加载预言文本
  this.loadMessages();
  
  // 加载音效资源
  this.loadAudioEffects();
}

// 加载预言文本
loadMessages() {
  // 从配置文件或内部定义加载预言文本
  this.specialMessages = { /* 特定关卡预言 */ };
  this.randomMessages = [ /* 随机预言 */ ];
  this.perfectMessages = [ /* 完美叠放预言 */ ];
  this.endingMessages = { /* 游戏结束预言 */ };
}

// 显示预言消息
displayMessage(message, duration = 5000) {
  // 如果已经有预言在显示，加入队列
  if (this.isDisplaying) {
    this.messageQueue.push({ message, duration });
    return;
  }
  
  this.isDisplaying = true;
  this.messageElement.innerHTML = message;
  this.messageElement.classList.add('visible');
  
  // 播放音效
  this.playOracleSound();
  
  // 设置超时隐藏
  setTimeout(() => {
    this.hideMessage();
  }, duration);
}

// 隐藏预言消息
hideMessage() {
  this.messageElement.classList.remove('visible');
  
  // 等待动画完成
  setTimeout(() => {
    this.isDisplaying = false;
    
    // 处理队列中的下一条消息
    if (this.messageQueue.length > 0) {
      const nextMessage = this.messageQueue.shift();
      this.displayMessage(nextMessage.message, nextMessage.duration);
    }
  }, 500); // 动画时长
}

// 根据塔层数触发预言
triggerByLevel(level) {
  // 检查是否为特定层数预言
  if (this.specialMessages[level]) {
    const messages = this.specialMessages[level];
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.displayMessage(message);
    return true;
  }
  
  // 或者随机触发
  if (level > 5 && Math.random() < 0.1) { // 10%的概率
    const message = this.randomMessages[Math.floor(Math.random() * this.randomMessages.length)];
    this.displayMessage(message);
    return true;
  }
  
  return false;
}

// 处理完美叠放
handlePerfectPlacement() {
  const message = this.perfectMessages[Math.floor(Math.random() * this.perfectMessages.length)];
  this.displayMessage(message);
}

// 生成游戏结束预言
generateEndingMessage(finalLevel) {
  let category = 'low';
  if (finalLevel > 20) category = 'high';
  else if (finalLevel > 10) category = 'medium';
  
  const messages = this.endingMessages[category];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  // 替换变量
  return message.replace('[LEVEL]', finalLevel);
}

// 播放预言音效
playOracleSound() {
  // 播放对应音效
}
```

## 集成到游戏中

Oracle系统需要在游戏的关键节点进行调用，主要在`Game`类中：

```javascript
// 在Game类中初始化Oracle
constructor() {
  // 现有代码...
  this.oracle = new Oracle(this);
}

// 在方块添加完成后调用
addBlock() {
  // 现有代码...
  
  // 触发预言（当成功添加方块后）
  if (this.blocks.length > 1) {
    this.oracle.triggerByLevel(this.blocks.length - 1);
  }
}

// 在完美叠放时调用
// 需要在判定逻辑中添加
if (newLength > 0.95 * lastBlock.dimension[dimensionAlongAxis]) {
  // 是完美叠放
  this.oracle.handlePerfectPlacement();
}

// 在游戏结束时调用
setState(state) {
  const oldState = this.state;
  // 现有代码...
  
  if (state === this.STATES.ENDED) {
    const endingMessage = this.oracle.generateEndingMessage(this.blocks.length - 1);
    setTimeout(() => {
      this.oracle.displayMessage(endingMessage, 8000); // 延长显示时间
    }, 1000); // 延迟显示
  }
  
  return oldState;
}
```

## 触发机制

### 基于层数的触发

系统会在特定的塔层数时触发预言：

| 层数 | 触发内容 | 预言类型 |
|------|---------|---------|
| 5 | 首次达到5层 | 鼓励预言 |
| 10 | 首次达到10层 | 赞扬预言 |
| 15 | 首次达到15层 | 挑战预言 |
| 20 | 首次达到20层 | 重要预言 |
| 25 | 首次达到25层 | 转折预言 |
| 30+ | 每5层触发一次 | 高级挑战预言 |

### 基于事件的触发

除层数外，系统还会根据特定游戏事件触发预言：

- **完美叠放**：当玩家叠放准确度极高时
- **连续成功**：当玩家连续成功叠放多次时
- **濒临失败**：当方块放置险些失败但成功时
- **游戏结束**：当玩家游戏结束时（根据最终高度有不同结局）

## 预言内容设计

### 预言类型

系统包含多种类型的预言文本：

1. **引导预言**：介绍游戏机制和目标
2. **鼓励预言**：在玩家表现良好时提供积极反馈
3. **挑战预言**：增加游戏难度和挑战感
4. **神秘预言**：提供模糊但引人深思的内容
5. **技巧预言**：提供游戏技巧和策略建议
6. **结局预言**：总结玩家的游戏表现

### 预言示例

以下是各类预言的示例文本：

#### 引导预言（5层）

```
"As you build higher, the winds of fate grow stronger. Steady your hand, mortal."
```

#### 鼓励预言（10层）

```
"Your tower rises toward Olympus. The gods have taken notice of your skill."
```

#### 挑战预言（15层）

```
"The path narrows, the challenge grows. Will your precision match your ambition?"
```

#### 完美叠放预言

```
"A placement worthy of Hephaestus himself! The gods applaud your precision."
```

#### 结局预言（低层）

```
"Your tower reached [LEVEL] levels. A modest beginning - even Icarus fell before soaring."
```

#### 结局预言（高层）

```
"[LEVEL] levels tall! Your creation stands as a monument to precision and patience. Athena smiles upon your wisdom."
```

## 视觉与音效设计

### 视觉效果

预言显示应具有以下视觉特点：

- **文本容器**：半透明的云雾效果，边缘模糊
- **文字效果**：金色文字，淡蓝色发光边缘
- **出现动画**：文字从模糊到清晰的淡入效果
- **消失动画**：文字向上飘散消失
- **背景效果**：预言出现时游戏背景轻微变暗

### CSS样式参考

```css
.oracle-message {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Palatino Linotype', serif;
  color: #f0d080;
  text-shadow: 0 0 10px rgba(100, 150, 255, 0.7);
  background: rgba(30, 50, 100, 0.3);
  border-radius: 20px;
  padding: 20px 30px;
  max-width: 80%;
  text-align: center;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.5s, transform 0.5s;
  pointer-events: none;
  backdrop-filter: blur(5px);
  z-index: 100;
}

.oracle-message.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

### 音效设计

预言系统包含以下音效：

- **预言出现音效**：神秘的弦乐和风声混合
- **文字显现音效**：轻微的水晶音效随文字显现
- **完美预言音效**：庄严的合唱团短音
- **结局预言音效**：更加宏大的音乐变化

## 性能优化

为确保预言系统不影响游戏性能：

1. **延迟加载**：游戏初始化后再加载预言系统资源
2. **文本预加载**：预加载所有预言文本，避免运行时加载
3. **CSS动画**：使用CSS动画而非JavaScript计算动画
4. **消息队列**：使用队列管理多条预言，避免重叠显示
5. **条件触发**：控制预言触发频率，避免过于频繁干扰

## 实现步骤

1. **创建文件**：新建`src/oracle.js`文件
2. **实现核心类**：按照上述类结构实现Oracle类
3. **设计预言内容**：创建不同类型的预言文本
4. **添加视觉样式**：在CSS中添加预言显示样式
5. **集成到游戏**：在Game类中初始化并调用Oracle系统
6. **测试优化**：测试各种游戏场景下预言系统的表现并优化

## 注意事项

1. **文本量控制**：预言文本不宜过长，控制在1-2句话为宜
2. **触发频率**：避免过于频繁触发预言，以免干扰游戏体验
3. **性能监控**：监控预言系统对游戏性能的影响，必要时进行优化
4. **响应式适配**：确保预言文本在各种屏幕尺寸下正常显示
5. **可配置性**：预留关闭预言系统的选项，让玩家可以自行选择 