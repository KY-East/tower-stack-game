const THREE = require('three');

const config = require('./config');

class Block {
  constructor(lastBlock=null, shouldReplace=false) {
    this.MOVE_AMOUNT = 45;  // 增加移动范围，比方块宽度稍大，增加游戏难度

    this.dimension = {};
    this.position = {};
    let color = null;
    let axis = null;

    const blockConfig = config.block;

    // set the dimensions from the target block, or defaults.
    let height, width, depth;
    let x,y,z;

    if (lastBlock){
      width = lastBlock.dimension.width;
      height = lastBlock.dimension.height;
      depth = lastBlock.dimension.depth;

      x = lastBlock.position.x;
      z = lastBlock.position.z;

      if (shouldReplace === true) {
        y = lastBlock.position.y;

        color = lastBlock.color.getHex();
        axis = lastBlock.axis;
      } else {
        y = lastBlock.position.y + blockConfig.initHeight;
      }

    } else {
      width = blockConfig.initWidth;
      height = blockConfig.initHeight;
      depth = blockConfig.initDepth;

      x = 0;
      y = blockConfig.initPosition.y;
      z = 0;
    }
    this.dimension.width = width;
    this.dimension.height = height;
    this.dimension.depth = depth;

    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    if (axis === null) {
      let random = Math.random();
      axis = random < 0.5 ? 'x': 'z';
    }
    this.axis = axis;

    if (lastBlock && !shouldReplace) {
      this.position[axis] = ((Math.random() > 0.5) ? 1 : -1) * this.MOVE_AMOUNT;
    }

    this.colorOffset = Math.round(Math.random() * 100);

    // 设置颜色 - 使用希腊风格颜色
    if (color === null) {
      color = this.getGreekStyleColor(lastBlock);
    }
    this.color = new THREE.Color(color);

    // set direction - 使用固定速度
    this.speed = -blockConfig.initSpeed;
    this.direction = this.speed;

    // create block
    let geometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2,
      this.dimension.height / 2, this.dimension.depth / 2));
    
    // 升级材质系统 - 使用更高级的材质效果
    this.material = new THREE.MeshPhongMaterial({
      color: this.color,
      specular: 0x333333,     // 高光颜色
      shininess: 15,          // 高光亮度
      flatShading: true,      // 平面着色
      transparent: false,
      opacity: 1.0
    });
    
    // 添加纹理贴图效果
    this.addTextureToMaterial();
    
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(this.position.x,
      this.position.y, this.position.z);
      
    // 添加阴影效果
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  // 根据高度选择希腊风格颜色
  getGreekStyleColor(lastBlock) {
    const blockConfig = config.block;
    
    // 确定当前方块的层级
    let level = 1; // 默认为第一层
    if (lastBlock) {
      // 基于高度估算层级
      level = Math.floor(this.position.y / blockConfig.initHeight);
    }
    
    let colorArray;
    
    // 根据层级选择颜色集合 - 使用简化版颜色方案
    if (level <= 3) {
      // 底部层 (1-3层)
      colorArray = blockConfig.colorByHeight.low;
    } else if (level <= 6) {
      // 中间层 (4-6层)
      colorArray = blockConfig.colorByHeight.mid;
    } else {
      // 顶部层 (7层以上)
      colorArray = blockConfig.colorByHeight.high;
    }
    
    // 从颜色集合中随机选择一个颜色
    const randomIndex = Math.floor(Math.random() * colorArray.length);
    return colorArray[randomIndex];
  }

  getAxis() {
    let dimensionAlongAxis = null;
    switch (this.axis) {
      case 'x':
        dimensionAlongAxis = 'width';
        break;
      case 'z':
        dimensionAlongAxis = 'depth';
    }
    return {
      axis: this.axis,
      dimensionAlongAxis,
    }
  }

  // 添加纹理到材质
  addTextureToMaterial() {
    // 根据方块高度选择不同的纹理效果
    const level = Math.floor(this.position.y / config.block.initHeight);
    
    if (level <= 3) {
      // 底部层 - 粗糙石材质感
      this.material.roughness = 0.8;
      this.material.metalness = 0.1;
    } else if (level <= 6) {
      // 中间层 - 中等粗糙度
      this.material.roughness = 0.5;
      this.material.metalness = 0.2;
    } else {
      // 顶部层 - 光滑大理石质感
      this.material.roughness = 0.3;
      this.material.metalness = 0.3;
    }
  }
}


class NormalBlock extends Block {
  constructor(lastBlock, shouldReplace=false) {
    super(lastBlock, shouldReplace);
  }

  reverseDirection() {
    this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed);
  }

  tick(speed=0) {
    let value = this.position[this.axis];
    if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) {
      this.reverseDirection();
    }
    this.position[this.axis] += this.direction;  // 使用固定速度
    this.mesh.position[this.axis] = this.position[this.axis];
  }
}

class FallingBlock extends Block {
  constructor(lastBlock) {
    super(lastBlock, true);
    this.speed *= 2;
    this.direction = this.speed;
  }

  tick() {
    let value = this.position.y;
    this.position.y -= Math.abs(this.direction);
    this.mesh.rotation.z += this.direction/6;
    this.mesh.position.y = this.position.y;
  }
}

module.exports = {
  NormalBlock,
  FallingBlock,
}
