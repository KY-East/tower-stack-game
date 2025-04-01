const Stage = require('./stage');
const { NormalBlock: Block, FallingBlock } = require('./block');

class Game {
  constructor() {
    this.STATES = {
      LOADING: 'loading',
      PLAYING: 'playing',
      READY: 'ready',
      ENDED: 'ended',
      RESETTING: 'resetting'
    }

    // 添加音效
    this.sounds = {
      perfect: new Audio('./sound/perfectDing.mp3'),
      failure: new Audio('./sound/failur.mp3'),
      bgm: new Audio('./sound/Olympic Glitch.mp3')  // 添加新的背景音乐
    }
    
    // 设置音效音量
    this.sounds.perfect.volume = 0.8;  // 调大Perfect音效音量 (0-1之间)
    this.sounds.failure.volume = 0.5;  // 保持失败音效适中
    this.sounds.bgm.volume = 0.4;      // 背景音乐音量适中
    this.sounds.bgm.loop = true;       // 设置循环播放
    
    // 调整判定阈值到5%
    this.JUDGMENT = {
      PERFECT: 0.93,  // 93%重叠判定为Perfect
      GOOD: 0.85     // 85%重叠判定为Good
    }

    this.blocks = [];
    this.fallingBlocks = [];
    this.state = this.STATES.LOADING;

    this.stage = new Stage();

    this.mainContainer = document.getElementById('container');
    this.scoreContainer = document.getElementById('score');
    this.startButton = document.getElementById('start-button');
    this.instructions = document.getElementById('instructions');
    this.scoreContainer.innerHTML = '0';

    // 添加最高分显示容器
    this.highScoreContainer = document.createElement('div');
    this.highScoreContainer.style.position = 'absolute';
    this.highScoreContainer.style.left = '40px';  // 调整到左边方块边缘附近
    this.highScoreContainer.style.bottom = '120px';  // 调整到稍微上面一点的位置
    this.highScoreContainer.style.fontSize = '16px';
    this.highScoreContainer.style.fontFamily = "'Press Start 2P', 'Orbitron', monospace";
    this.highScoreContainer.style.color = '#FFD700';
    this.highScoreContainer.style.textShadow = '0 0 5px rgba(255,215,0,0.5)';
    this.highScoreContainer.style.textAlign = 'left';
    this.mainContainer.appendChild(this.highScoreContainer);

    // 从localStorage读取最高分记录
    this.highScores = JSON.parse(localStorage.getItem('towerHighScores')) || [];
    this.updateHighScore();

    // 添加判定文字显示容器
    this.judgmentContainer = document.createElement('div');
    this.judgmentContainer.id = 'judgment';
    this.judgmentContainer.style.position = 'absolute';
    this.judgmentContainer.style.top = '50%';
    this.judgmentContainer.style.left = '50%';
    this.judgmentContainer.style.transform = 'translate(-50%, -50%) scale(0.8)';
    this.judgmentContainer.style.fontSize = '48px';
    this.judgmentContainer.style.fontFamily = "'Press Start 2P', 'Orbitron', monospace";
    this.judgmentContainer.style.textAlign = 'center';
    this.judgmentContainer.style.opacity = '0';
    this.judgmentContainer.style.transition = 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    this.judgmentContainer.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
    this.judgmentContainer.style.zIndex = '1000';
    this.mainContainer.appendChild(this.judgmentContainer);

    // 修改倍率显示容器位置到Perfect判定下方
    this.multiplierContainer = document.createElement('div');
    this.multiplierContainer.id = 'multiplier';
    this.multiplierContainer.style.position = 'absolute';
    this.multiplierContainer.style.top = '60%';  // Perfect判定下方
    this.multiplierContainer.style.left = '50%';
    this.multiplierContainer.style.transform = 'translateX(-50%)';
    this.multiplierContainer.style.fontSize = '32px';
    this.multiplierContainer.style.fontFamily = "'Press Start 2P', 'Orbitron', monospace";
    this.multiplierContainer.style.color = '#FFD700';
    this.multiplierContainer.style.textShadow = '0 0 10px rgba(255,215,0,0.7)';
    this.multiplierContainer.style.opacity = '0';
    this.multiplierContainer.style.transition = 'all 0.3s ease-in-out';
    this.multiplierContainer.style.zIndex = '1000';
    this.mainContainer.appendChild(this.multiplierContainer);

    // 添加新的CSS动画
    const multiplierStyle = document.createElement('style');
    multiplierStyle.textContent = `
      @keyframes multiplierPop {
        0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
        50% { transform: translateX(-50%) scale(1.2); opacity: 1; }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }
      @keyframes multiplierGlow {
        0% { text-shadow: 0 0 10px rgba(255,215,0,0.7); }
        50% { text-shadow: 0 0 20px rgba(255,215,0,0.9), 0 0 30px rgba(255,215,0,0.5); }
        100% { text-shadow: 0 0 10px rgba(255,215,0,0.7); }
      }
      @keyframes totalScorePop {
        0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
        50% { transform: translateX(-50%) scale(1.2); opacity: 1; }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }
      @keyframes totalScoreFadeOut {
        0% { transform: translateX(-50%) scale(1); opacity: 1; }
        100% { transform: translateX(-50%) scale(0.8); opacity: 0; }
      }
      @keyframes newRecord {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); color: #FFA500; }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(multiplierStyle);

    // 添加字体链接
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes popIn {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      @keyframes shakeText {
        0% { transform: translate(-50%, -50%) scale(1); }
        10% { transform: translate(-53%, -48%) rotate(-3deg); }
        20% { transform: translate(-47%, -52%) rotate(3deg); }
        30% { transform: translate(-52%, -48%) rotate(-2deg); }
        40% { transform: translate(-48%, -52%) rotate(2deg); }
        50% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes glowPulse {
        0% { text-shadow: 0 0 10px rgba(255,215,0,0.5), 0 0 20px rgba(255,215,0,0.3); }
        50% { text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.3); }
        100% { text-shadow: 0 0 10px rgba(255,215,0,0.5), 0 0 20px rgba(255,215,0,0.3); }
      }
      @keyframes slideInGood {
        0% { transform: translate(-50%, -100%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -30%) scale(1.1); opacity: 1; }
        70% { transform: translate(-50%, -55%) scale(0.95); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      @keyframes missShake {
        0% { transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        10% { transform: translate(-55%, -50%) scale(1.1); filter: blur(1px); }
        20% { transform: translate(-45%, -50%) scale(0.9); filter: blur(2px); }
        30% { transform: translate(-53%, -50%) scale(1.05); filter: blur(1px); }
        40% { transform: translate(-47%, -50%) scale(0.95); filter: blur(2px); }
        50% { transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        100% { transform: translate(-50%, -50%) scale(1); filter: blur(0); }
      }
    `;
    document.head.appendChild(style);

    this.music = document.getElementById('music')

    // 添加计分相关属性
    this.score = 0;  // 总分
    this.perfectStreak = 0;  // Perfect连击次数
    this.totalPerfectCount = 0;  // Perfect总次数
    this.scoreMultiplier = 1;  // 总分倍率

    this.addBlock();
    this.tick();

    for (let key in this.STATES) {
      this.mainContainer.classList.remove(this.STATES[key]);
    }
    this.setState(this.STATES.READY);

    document.addEventListener('keydown', e => {
      if(e.keyCode === 32) { // Space
        this.handleEvent();
      }
    });

    document.addEventListener('click', e => {
      this.handleEvent();
    });

    document.addEventListener('touchend', e => {
      this.handleEvent();
    });
  }

  handleEvent() {
    switch (this.state) {
      case this.STATES.READY:
        this.setState(this.STATES.PLAYING);
        this.sounds.bgm.play();  // 使用新的背景音乐
        // 重置所有计分相关数据
        this.score = 0;
        this.perfectStreak = 0;
        this.totalPerfectCount = 0;
        this.scoreMultiplier = 1;
        this.scoreContainer.innerHTML = '0';
        this.addBlock();
        break;
      case this.STATES.PLAYING:
        this.addBlock();
        break;
      case this.STATES.ENDED:
        this.blocks.forEach(block => {
          this.stage.remove(block.mesh);
        })
        this.blocks = [];
        this.scoreContainer.innerHTML = '0';
        this.sounds.bgm.pause();        // 游戏结束时暂停背景音乐
        this.sounds.bgm.currentTime = 0; // 重置音乐播放位置
        this.addBlock();
        this.setState(this.STATES.READY);
        break;
      default:
        break;
    }
  }

  // 添加判定函数
  calculateOverlap(currentBlock, previousBlock) {
    const { axis } = currentBlock.getAxis();
    const distance = Math.abs(currentBlock.position[axis] - previousBlock.position[axis]);
    const blockSize = currentBlock.dimension[axis === 'x' ? 'width' : 'depth'];
    return 1 - (distance / blockSize);
  }

  // 添加判定等级检查函数
  checkAlignment(currentBlock, previousBlock) {
    const overlap = this.calculateOverlap(currentBlock, previousBlock);
    
    if (overlap >= this.JUDGMENT.PERFECT) {
      return 'perfect';
    } else if (overlap >= this.JUDGMENT.GOOD) {
      return 'good';
    }
    return 'miss';
  }

  // 显示判定文字
  showJudgment(type) {
    this.judgmentContainer.style.opacity = '0';
    this.judgmentContainer.style.animation = 'none';
    this.judgmentContainer.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // 强制重绘
    void this.judgmentContainer.offsetWidth;
    
    if (type === 'perfect') {
      this.judgmentContainer.textContent = '✨ PERFECT! ✨';
      this.judgmentContainer.style.color = '#FFD700';
      this.judgmentContainer.style.fontSize = '52px';
      this.judgmentContainer.style.fontWeight = '700';
      this.judgmentContainer.style.animation = 'popIn 0.3s forwards, glowPulse 2s infinite';
      this.judgmentContainer.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)';
    } else if (type === 'good') {
      this.judgmentContainer.textContent = '⭐ GOOD! ⭐';
      this.judgmentContainer.style.color = '#00FF00';
      this.judgmentContainer.style.fontSize = '46px';
      this.judgmentContainer.style.fontWeight = '600';
      this.judgmentContainer.style.animation = 'slideInGood 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
      this.judgmentContainer.style.textShadow = `
        0 0 10px rgba(0, 255, 0, 0.7),
        2px 2px 4px rgba(0, 0, 0, 0.3)
      `;
    } else {
      this.judgmentContainer.textContent = '💢 MISS 💢';
      this.judgmentContainer.style.color = '#FF3333';
      this.judgmentContainer.style.fontSize = '44px';
      this.judgmentContainer.style.fontWeight = '500';
      this.judgmentContainer.style.animation = 'missShake 0.5s cubic-bezier(0.36, 0, 0.66, -0.56) forwards';
      this.judgmentContainer.style.textShadow = `
        0 0 10px rgba(255, 0, 0, 0.7),
        -2px 0 0 rgba(255, 0, 0, 0.4),
        2px 0 0 rgba(255, 0, 0, 0.4)
      `;
    }

    // 根据类型设置不同的消失时间和效果
    const duration = type === 'perfect' ? 1500 : (type === 'good' ? 1200 : 800);
    setTimeout(() => {
      if (type === 'miss') {
        // MISS 快速褪色消失
        this.judgmentContainer.style.transition = 'all 0.2s ease-in';
      } else {
        // PERFECT 和 GOOD 缓慢淡出
        this.judgmentContainer.style.transition = 'all 0.4s ease-out';
      }
      this.judgmentContainer.style.opacity = '0';
      this.judgmentContainer.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }, duration);
  }

  addBlock() {
    let lastBlock = this.blocks[this.blocks.length - 1];
    const lastToLastBlock = this.blocks[this.blocks.length - 2];
    
    if (lastBlock && lastToLastBlock) {
      const { axis, dimensionAlongAxis } = lastBlock.getAxis();
      const distance = lastBlock.position[axis] - lastToLastBlock.position[axis];
      let position, dimension;
      let positionFalling, dimensionFalling;
      const { color } = lastBlock;

      // 先进行判定
      const judgment = this.checkAlignment(lastBlock, lastToLastBlock);
      
      // 显示判定文字
      this.showJudgment(judgment);
      console.log('Judgment:', judgment); // 添加调试日志

      // 如果是MISS并且切割后会太小，直接结束游戏
      const newLength = lastBlock.dimension[dimensionAlongAxis] - Math.abs(distance);
      const MIN_SIZE = 2;
      
      if (judgment === 'miss' && newLength <= MIN_SIZE) {
        this.stage.remove(lastBlock.mesh);
        // 播放失败音效
        this.sounds.failure.play();
        setTimeout(() => {
          this.setState(this.STATES.ENDED);
          this.sounds.bgm.pause();
        }, 800);
        return;
      }

      // Perfect判定：保持完整方块
      if (judgment === 'perfect') {
        // 播放Perfect音效
        this.sounds.perfect.play();
        // 触发震屏效果
        this.stage.screenShake();
        // 添加光效
        this.stage.createPerfectEffect(lastBlock.position, lastBlock.getAxis().axis);
        
        // 更新Perfect统计
        this.perfectStreak++;
        this.totalPerfectCount++;
        
        // 计算当前连击倍率
        let comboMultiplier = 1;
        if (this.perfectStreak >= 10) {
          comboMultiplier = 5;  // 10连击 5倍
          this.showMultiplier(5);  // 显示5倍
        } else if (this.perfectStreak >= 5) {
          comboMultiplier = 3;  // 5连击 3倍
          this.showMultiplier(3);  // 显示3倍
        } else if (this.perfectStreak >= 3) {
          comboMultiplier = 2;  // 3连击 2倍
          this.showMultiplier(2);  // 显示2倍
        }
        
        // 检查是否需要更新总分倍率
        if (this.totalPerfectCount > 0 && this.totalPerfectCount % 10 === 0) {
          this.scoreMultiplier *= 2;  // 每10次Perfect总分翻倍
          this.showTotalScoreMultiplier();  // 显示总分倍率提示
        }
        
        // 更新连击显示
        if (this.perfectStreak > 1) {
          this.judgmentContainer.textContent = `✨ PERFECT ${this.perfectStreak}! ✨`;
        }
        
        // Perfect基础得3分
        const baseScore = 3;
        const finalScore = baseScore * comboMultiplier * this.scoreMultiplier;
        this.score += finalScore;
        
        // 更新显示
        this.scoreContainer.innerHTML = String(this.score);
        
        position = { ...lastBlock.position };
        position[axis] = lastToLastBlock.position[axis];
        dimension = { ...lastBlock.dimension };
        
        this.blocks.pop();
        this.stage.remove(lastBlock.mesh);
        lastBlock = new Block({ dimension, position, color, axis }, true);
        this.blocks.push(lastBlock);
        this.stage.add(lastBlock.mesh);
      } else {
        // 非Perfect情况，重置连击数和总分倍率相关数据
        this.perfectStreak = 0;
        this.totalPerfectCount = 0;  // 重置Perfect总数
        this.scoreMultiplier = 1;    // 重置总分倍率
        // 让连击奖励显示淡出
        this.showMultiplier(1);
        
        if (judgment === 'good') {
          // Good得2分
          this.score += 2;
        } else {
          // 其他情况得1分
          this.score += 1;
        }
        this.scoreContainer.innerHTML = String(this.score);
        
        // 保持原有的切割逻辑
        dimension = { ...lastBlock.dimension }
        dimension[dimensionAlongAxis] = newLength;
        
        dimensionFalling = { ...lastBlock.dimension }
        dimensionFalling[dimensionAlongAxis] = Math.abs(distance);

        if (distance >= 0) {
          position = lastBlock.position;
          positionFalling = { ...lastBlock.position };
          positionFalling[axis] = lastBlock.position[axis] + newLength;
        } else {
          position = { ...lastBlock.position };
          position[axis] = lastBlock.position[axis] + Math.abs(distance);
          positionFalling = { ...lastBlock.position };
          positionFalling[axis] = lastBlock.position[axis] - Math.abs(distance);
        }

        this.blocks.pop();
        this.stage.remove(lastBlock.mesh);
        lastBlock = new Block({ dimension, position, color, axis }, true);
        this.blocks.push(lastBlock);
        this.stage.add(lastBlock.mesh);

        const fallingBlock = new FallingBlock({
          dimension: dimensionFalling,
          position: positionFalling,
          color,
        });

        this.fallingBlocks.push(fallingBlock);
        this.stage.add(fallingBlock.mesh);
      }
    }

    this.scoreContainer.innerHTML = String(this.score);

    const newBlock = new Block(lastBlock);
    this.stage.add(newBlock.mesh);
    this.blocks.push(newBlock);

    if (this.blocks.length > 3) {
      const blockHeight = newBlock.dimension.height;
      const cameraOffset = (this.blocks.length - 3) * blockHeight;
      this.stage.setCamera(cameraOffset);
    }
  }

  setState(state) {
    const oldState = this.state;
    this.mainContainer.classList.remove(this.state);
    this.state = state;
    this.mainContainer.classList.add(this.state);

    // 在游戏结束时更新最高分
    if (state === this.STATES.ENDED) {
      this.updateHighScore();
      this.sounds.failure.play();
    }

    return oldState;
  }

  tick() {
    if (this.blocks.length > 1) {
      this.blocks[this.blocks.length - 1].tick(this.blocks.length/10);
    }
    this.fallingBlocks.forEach(block => block.tick());
    this.fallingBlocks = this.fallingBlocks.filter(block => {
      if (block.position.y > 0) {
        return true;
      } else {
        this.stage.remove(block.mesh);
        return false;
      }
    });
    this.stage.render();
    requestAnimationFrame(() => {this.tick()});
  }

  // 显示倍率的函数
  showMultiplier(multiplier) {
    if (multiplier <= 1) {
      // 当倍率为1或更小时（即断连时），让显示淡出消失
      this.multiplierContainer.style.opacity = '0';
      this.multiplierContainer.style.animation = 'none';
      return;
    }

    let multiplierText = '';
    if (multiplier === 2) {
      multiplierText = '×2 SCORE!';
      this.multiplierContainer.style.color = '#4169E1';  // 皇家蓝
    } else if (multiplier === 3) {
      multiplierText = '×3 SCORE!';
      this.multiplierContainer.style.color = '#9932CC';  // 深紫色
    } else if (multiplier === 5) {
      multiplierText = '×5 SCORE!';
      this.multiplierContainer.style.color = '#FFD700';  // 金色
    }

    this.multiplierContainer.textContent = multiplierText;
    this.multiplierContainer.style.opacity = '1';
    this.multiplierContainer.style.animation = 'multiplierPop 0.3s forwards, multiplierGlow 2s infinite';
    
    // 强制重绘以确保动画重新开始
    void this.multiplierContainer.offsetWidth;
  }

  // 添加新方法：显示总分倍率
  showTotalScoreMultiplier() {
    // 创建一个临时的显示容器
    const totalScoreContainer = document.createElement('div');
    totalScoreContainer.style.position = 'absolute';
    totalScoreContainer.style.top = '65%';  // 放在combo显示的下方
    totalScoreContainer.style.left = '50%';
    totalScoreContainer.style.transform = 'translateX(-50%)';
    totalScoreContainer.style.fontSize = '28px';
    totalScoreContainer.style.fontFamily = "'Press Start 2P', 'Orbitron', monospace";
    totalScoreContainer.style.color = '#FFA500';  // 橙色
    totalScoreContainer.style.textShadow = '0 0 10px rgba(255,165,0,0.7)';
    totalScoreContainer.style.opacity = '0';
    totalScoreContainer.style.zIndex = '1000';
    totalScoreContainer.style.animation = 'totalScorePop 0.5s forwards';
    totalScoreContainer.textContent = `TOTAL SCORE ×${this.scoreMultiplier}!`;
    
    this.mainContainer.appendChild(totalScoreContainer);

    // 3秒后移除显示
    setTimeout(() => {
      totalScoreContainer.style.animation = 'totalScoreFadeOut 0.5s forwards';
      setTimeout(() => {
        this.mainContainer.removeChild(totalScoreContainer);
      }, 500);
    }, 3000);
  }

  // 更新最高分显示方法
  updateHighScore() {
    // 如果当前分数大于0，添加到高分列表
    if (this.score > 0) {
      this.highScores.push(this.score);
      // 排序并只保留前5个最高分
      this.highScores.sort((a, b) => b - a);
      this.highScores = this.highScores.slice(0, 5);
      // 保存到localStorage
      localStorage.setItem('towerHighScores', JSON.stringify(this.highScores));
    }

    // 显示最高分列表
    let highScoreText = 'HIGH SCORES:\n';
    this.highScores.forEach((score, index) => {
      // 如果是新记录，添加闪烁效果
      const isNewRecord = this.score === score && this.score > 0;
      const rankEmoji = ['👑', '🥈', '🥉', '4️⃣', '5️⃣'][index];
      const scoreText = `${rankEmoji} ${score}`;
      
      if (isNewRecord) {
        highScoreText += `<div class="new-record">${scoreText}</div>\n`;
      } else {
        highScoreText += `<div>${scoreText}</div>\n`;
      }
    });

    // 如果没有任何记录，显示默认信息
    if (this.highScores.length === 0) {
      highScoreText += '<div>No records yet!</div>';
    }

    this.highScoreContainer.innerHTML = highScoreText;
    
    // 如果有新纪录，添加动画效果
    const newRecordElement = this.highScoreContainer.querySelector('.new-record');
    if (newRecordElement) {
      newRecordElement.style.animation = 'newRecord 0.5s ease-in-out';
    }
  }
}

module.exports = Game;
