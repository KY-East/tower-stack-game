/**
 * Greek Style Block Renderer
 * Creates and styles blocks with Greek architectural elements
 */
class GreekBlockRenderer {
  constructor(options = {}) {
    // Configuration with defaults
    this.config = {
      // Base colors
      colors: options.colors || [
        0x0064a8, // Greek blue
        0xf5f5f5, // Marble white
        0xd6bb8e, // Temple brown
        0xd4af37, // Gold
        0x708d23  // Olive green
      ],
      
      // Material settings
      flatShading: options.flatShading !== undefined ? options.flatShading : true,
      useWireframe: options.useWireframe !== undefined ? options.useWireframe : false,
      
      // Edge highlighting
      addEdges: options.addEdges !== undefined ? options.addEdges : true,
      edgeColor: options.edgeColor || 0xffffff,
      edgeOpacity: options.edgeOpacity || 0.5,
      
      // Greek pattern details
      addPatterns: options.addPatterns !== undefined ? options.addPatterns : true,
      patternDensity: options.patternDensity || 0.5,
      
      // Texture settings
      useTextures: options.useTextures !== undefined ? options.useTextures : false,
      marbleTexture: options.marbleTexture || null,
      
      // Visual effects
      shininess: options.shininess || 30,
      opacity: options.opacity || 1.0
    };
    
    // Initialize loader if textures are used
    if (this.config.useTextures && !this.config.marbleTexture) {
      this.textureLoader = new THREE.TextureLoader();
    }
  }
  
  /**
   * Create a Greek style block mesh
   * @param {Object} dimensions - Block dimensions {width, height, depth}
   * @param {Object} options - Optional overrides for this specific block
   * @returns {THREE.Mesh} The created mesh
   */
  createBlockMesh(dimensions, options = {}) {
    // Merge options with defaults
    const blockOptions = {
      color: options.color || this.getRandomColor(),
      dimensions: dimensions || { width: 6, height: 2, depth: 6 },
      addEdges: options.addEdges !== undefined ? options.addEdges : this.config.addEdges,
      addPatterns: options.addPatterns !== undefined ? options.addPatterns : this.config.addPatterns
    };
    
    // Create geometry
    const geometry = this.createGeometry(blockOptions.dimensions);
    
    // Create material
    const material = this.createMaterial(blockOptions.color);
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add edges
    if (blockOptions.addEdges) {
      const edges = this.createEdges(geometry);
      mesh.add(edges);
    }
    
    // Add Greek patterns
    if (blockOptions.addPatterns) {
      this.addGreekPatterns(mesh, blockOptions.dimensions);
    }
    
    return mesh;
  }
  
  /**
   * Create block geometry
   * @param {Object} dimensions - Block dimensions {width, height, depth}
   * @returns {THREE.BoxGeometry} The created geometry
   */
  createGeometry(dimensions) {
    const geometry = new THREE.BoxGeometry(
      dimensions.width,
      dimensions.height,
      dimensions.depth
    );
    
    // Center the geometry properly
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(
      dimensions.width / 2,
      dimensions.height / 2,
      dimensions.depth / 2
    ));
    
    return geometry;
  }
  
  /**
   * Create block material
   * @param {number} color - Hex color value
   * @returns {THREE.Material} The created material
   */
  createMaterial(color) {
    if (this.config.useTextures && this.config.marbleTexture) {
      // Use provided texture
      return new THREE.MeshStandardMaterial({
        map: this.config.marbleTexture,
        color: color,
        flatShading: this.config.flatShading,
        wireframe: this.config.useWireframe,
        transparent: this.config.opacity < 1,
        opacity: this.config.opacity,
        roughness: 0.3,
        metalness: 0.1
      });
    } else {
      // Use color only
      return new THREE.MeshToonMaterial({
        color: color,
        flatShading: this.config.flatShading,
        wireframe: this.config.useWireframe,
        transparent: this.config.opacity < 1,
        opacity: this.config.opacity,
        shininess: this.config.shininess
      });
    }
  }
  
  /**
   * Create edges for the block
   * @param {THREE.BoxGeometry} geometry - Block geometry
   * @returns {THREE.LineSegments} Edge lines
   */
  createEdges(geometry) {
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: this.config.edgeColor,
      transparent: true,
      opacity: this.config.edgeOpacity
    });
    
    return new THREE.LineSegments(edgesGeometry, edgesMaterial);
  }
  
  /**
   * Add Greek style decorative patterns to the block
   * @param {THREE.Mesh} mesh - The block mesh
   * @param {Object} dimensions - Block dimensions
   */
  addGreekPatterns(mesh, dimensions) {
    // Only add patterns above a certain size
    if (dimensions.width < 3 || dimensions.height < 1.5 || dimensions.depth < 3) {
      return;
    }
    
    // Create Greek meander pattern on appropriate faces
    this.addMeanderPattern(mesh, dimensions);
  }
  
  /**
   * Add Greek meander pattern to the block
   * @param {THREE.Mesh} mesh - The block mesh
   * @param {Object} dimensions - Block dimensions
   */
  addMeanderPattern(mesh, dimensions) {
    // Pattern density affects number of details
    const density = this.config.patternDensity;
    if (density <= 0) return;
    
    // Create a thin box for the pattern border (simplified approach)
    const patternWidth = Math.min(dimensions.width, dimensions.depth) * 0.9;
    const patternHeight = dimensions.height * 0.2;
    const patternDepth = 0.1;
    
    // Create pattern on top face
    const patternGeometry = new THREE.BoxGeometry(
      patternWidth, 
      patternDepth, 
      patternHeight
    );
    
    // Use a contrasting color
    const isLight = this.isLightColor(mesh.material.color.getHex());
    const patternColor = isLight ? 0x0064a8 : 0xf5f5f5; // Blue or white
    
    const patternMaterial = new THREE.MeshBasicMaterial({
      color: patternColor,
      transparent: true,
      opacity: 0.8
    });
    
    // Create pattern mesh and position it
    const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
    pattern.position.set(
      dimensions.width / 2,
      dimensions.height - patternDepth / 2,
      dimensions.depth / 2
    );
    
    mesh.add(pattern);
  }
  
  /**
   * Get a random color from the defined Greek color palette
   * @returns {number} Hex color value
   */
  getRandomColor() {
    return this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
  }
  
  /**
   * Check if a color is light or dark
   * @param {number} color - Hex color value
   * @returns {boolean} True if color is light
   */
  isLightColor(color) {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    
    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
  /**
   * Load marble texture (if textures are enabled)
   * @param {string} path - Path to texture image
   * @returns {Promise} Promise that resolves when texture is loaded
   */
  loadMarbleTexture(path) {
    return new Promise((resolve, reject) => {
      if (!this.config.useTextures) {
        resolve(null);
        return;
      }
      
      if (!this.textureLoader) {
        this.textureLoader = new THREE.TextureLoader();
      }
      
      this.textureLoader.load(
        path,
        texture => {
          this.config.marbleTexture = texture;
          this.config.marbleTexture.wrapS = THREE.RepeatWrapping;
          this.config.marbleTexture.wrapT = THREE.RepeatWrapping;
          resolve(texture);
        },
        undefined,
        error => {
          console.error('Error loading texture:', error);
          reject(error);
        }
      );
    });
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.GreekBlockRenderer = GreekBlockRenderer;
}

// Also support module exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GreekBlockRenderer;
} 