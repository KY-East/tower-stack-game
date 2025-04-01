const THREE = require('three');
const { TweenLite } = require('../lib/TweenLite');

const helper = require('./helper');

const config = require('./config');

class Stage {
  constructor() {
    // container
    this.container = document.getElementById('game');

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1A75BB, 1);
    
    // 启用阴影渲染
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();

    // camera
    const cameraConfig = config.camera;
    const aspect = window.innerWidth / window.innerHeight;
    const depth = cameraConfig.depth;
    this.camera = new THREE.OrthographicCamera(
      -depth * aspect, 
      depth * aspect, 
      depth, 
      -depth, 
      cameraConfig.near, 
      cameraConfig.far
    );
    this.camera.position.fromArray(cameraConfig.position);
    this.camera.lookAt(new THREE.Vector3().fromArray(cameraConfig.lookAt));

    // light
    const lightsConfig = config.lights;
    lightsConfig.forEach((lightConfig) => {
      const LightClass = helper.get(THREE, lightConfig.type);
      if (LightClass) {
        const light = new LightClass(lightConfig.color, lightConfig.intensity);
        light.position.fromArray(lightConfig.position);
        
        // 为平行光启用阴影
        if (lightConfig.type === 'DirectionalLight') {
          light.castShadow = true;
          
          // 调整阴影相机参数
          light.shadow.camera.near = 1;
          light.shadow.camera.far = 1000;
          light.shadow.camera.left = -50;
          light.shadow.camera.right = 50;
          light.shadow.camera.top = 50;
          light.shadow.camera.bottom = -50;
          
          // 提高阴影质量
          light.shadow.mapSize.width = 1024;
          light.shadow.mapSize.height = 1024;
        }
        
        this.scene.add(light);
      }
    });
    
    // 添加环境光，提供柔和的整体照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // 添加效果数组，用于管理动画效果
    this.effects = [];

    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  setCamera(y, speed = 0.3) {
    TweenLite.to(this.camera.position, speed, {y: y + 4, ease: Power1.easeInOut});
    TweenLite.to(this.camera.lookAt, speed, {y: y, ease: Power1.easeInOut});
  }

  onResize() {
    let viewSize = 30;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.left = window.innerWidth / - viewSize;
    this.camera.right = window.innerWidth / viewSize;
    this.camera.top = window.innerHeight / viewSize;
    this.camera.bottom = window.innerHeight / - viewSize;
    this.camera.updateProjectionMatrix();
  }

  render() {
    // 更新效果动画
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      effect.scale += 0.1;
      effect.opacity -= 0.02;
      
      effect.mesh.scale.set(effect.scale, effect.scale, 1);
      effect.material.opacity = effect.opacity;
      
      // 当效果结束时，清理资源
      if (effect.scale > 3) {
        this.scene.remove(effect.mesh);
        effect.geometry.dispose();
        effect.material.dispose();
        this.effects.splice(i, 1);
      }
    }

    // 原有的渲染逻辑
    this.renderer.render(this.scene, this.camera);
  }

  add(elem) {
    this.scene.add(elem);
  }

  remove(elem) {
    this.scene.remove(elem);
  }

  // 添加震屏效果方法
  screenShake(intensity = 0.6, duration = 250) {
    const originalPosition = this.camera.position.clone();
    let startTime = Date.now();
    
    // 如果已经在震动，先取消之前的震动
    if (this.currentShake) {
      cancelAnimationFrame(this.currentShake);
    }
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        // 使用正弦函数使震动更平滑
        const progress = elapsed / duration;
        // 调整震动频率从30到20，使每次震动更明显
        // 同时减缓衰减速度，让震动持续更久
        const shake = Math.sin(progress * 20) * Math.pow(1 - progress, 0.8); 
        
        // 增加横向震动幅度
        this.camera.position.x = originalPosition.x + shake * intensity;
        // 保持较小的纵向震动
        this.camera.position.z = originalPosition.z + shake * intensity * 0.3;
        
        this.currentShake = requestAnimationFrame(animate);
      } else {
        // 恢复相机原始位置
        this.camera.position.copy(originalPosition);
        this.currentShake = null;
      }
    };
    
    animate();
  }

  // 添加Perfect效果方法
  createPerfectEffect(position, axis) {
    // 使用方块实际尺寸作为光效大小
    const effectWidth = axis === 'x' ? 40 : 30;  // 增加宽度
    const effectHeight = 30;  // 增加高度
    const geometry = new THREE.PlaneGeometry(effectWidth, effectHeight);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.6,  // 降低透明度
      side: THREE.DoubleSide,
      depthTest: false
    });
    
    const effect = new THREE.Mesh(geometry, material);
    
    // 根据方块朝向调整平面位置和旋转
    if (axis === 'x') {
      effect.rotation.y = Math.PI / 2;
      // 在x轴方向上偏移到边缘
      effect.position.copy(position);
      effect.position.x += 10;  // 向右偏移到边缘
    } else {
      effect.rotation.x = Math.PI / 2;
      // 在z轴方向上偏移到边缘
      effect.position.copy(position);
      effect.position.z += 10;  // 向前偏移到边缘
    }
    
    this.scene.add(effect);
    
    // 动画参数
    const effectData = {
      mesh: effect,
      geometry: geometry,
      material: material,
      scale: 1,
      opacity: 0.6  // 同步降低初始透明度
    };
    
    this.effects.push(effectData);
    
    // 创建对称的效果（另一边）
    const effect2 = effect.clone();
    if (axis === 'x') {
      effect2.position.x = position.x - 10;  // 向左偏移到边缘
    } else {
      effect2.position.z = position.z - 10;  // 向后偏移到边缘
    }
    
    this.scene.add(effect2);
    
    // 添加第二个效果到动画列表
    const effectData2 = {
      mesh: effect2,
      geometry: geometry,
      material: material.clone(),
      scale: 1,
      opacity: 0.6  // 同步降低初始透明度
    };
    
    this.effects.push(effectData2);
  }
}

module.exports = Stage;
