module.exports = {
    block: {
        initWidth: 30, // Initial width of the box (x axis)
        initHeight: 15, // Initial height of the box (y axis)
        initDepth: 30, // Initial depth of the box (z axis)

        initColor: 0xad6c86, // Initial color
        
        // 初始位置配置
        initPosition: {
            y: 1  // 保持较低的初始位置
        },

        initSpeed: 0.3, // 固定移动速度，保持原来的初始速度
        
        // 希腊风格颜色方案 - 简化版
        greekColors: {
            marbleWhite: 0xF5F5F5,    // 大理石白 - 代表神庙和雕塑
            ochreYellow: 0xD4B16A,    // 赭石黄 - 代表古老卷轴和沙地
            oliveGreen: 0x708D23,     // 橄榄绿 - 代表橄榄树和自然环境
            terracottaRed: 0xB64534   // 陶器红 - 代表希腊陶器
        },
        
        // 基于高度的颜色分配 - 简化版，移除了蓝色以防止与背景重叠
        colorByHeight: {
            low: [                    // 底部层 (1-3层)
                0xB64534,             // 陶器红
                0xD4B16A              // 赭石黄
            ],
            mid: [                    // 中间层 (4-6层)
                0xD4B16A,             // 赭石黄
                0x708D23              // 橄榄绿
            ],
            high: [                   // 顶部层 (7层以上)
                0xF5F5F5,             // 大理石白
                0xD4B16A              // 赭石黄
            ]
        }
    },

    camera: {
        depth: 40,
        near: -100,
        far: 1000,
        position: [2, 2, 2],     // 恢复原始位置
        lookAt: [0, 0, 0],       // 恢复原始观察点
    },

    lights: [
        {
            type: "DirectionalLight",
            intensity: 0.5,
            position: [0, 499, 0],
            color: 0xffffff,
        }
    ],
};
