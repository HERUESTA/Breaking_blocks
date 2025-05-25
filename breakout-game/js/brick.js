/**
 * ブロッククラス
 * 個々のブロックの状態と描画を管理
 */
class Brick {
    /**
     * ブロックの初期化
     * @param {number} x - ブロックのX座標
     * @param {number} y - ブロックのY座標
     * @param {number} width - ブロックの幅
     * @param {number} height - ブロックの高さ
     * @param {string} color - ブロックの色
     * @param {number} points - ブロック破壊時の得点
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    constructor(x, y, width, height, color, points, ctx) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.points = points;
        this.ctx = ctx;
        this.isVisible = true;
    }

    /**
     * ブロックを描画
     */
    draw() {
        if (!this.isVisible) return;
        
        this.ctx.beginPath();
        
        // グラデーション背景
        const gradient = this.ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.getDarkerColor(this.color));
        
        // 影効果
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetY = 2;
        
        // ブロック本体
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 影をリセット
        this.ctx.shadowColor = 'transparent';
        
        // ブロックの上面に光沢効果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 3);
        
        // ブロックの枠線
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        this.ctx.closePath();
    }

    /**
     * 色を暗くする補助関数
     * @param {string} color - 元の色（HEX形式）
     * @returns {string} - 暗くした色
     */
    getDarkerColor(color) {
        // 簡易的な色の暗化処理
        const r = parseInt(color.substring(1, 3), 16) * 0.7;
        const g = parseInt(color.substring(3, 5), 16) * 0.7;
        const b = parseInt(color.substring(5, 7), 16) * 0.7;
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}

/**
 * ブロックマネージャークラス
 * 複数のブロックの配置と管理を行う
 */
class BrickManager {
    /**
     * ブロックマネージャーの初期化
     * @param {number} rows - ブロックの行数
     * @param {number} cols - ブロックの列数
     * @param {number} canvasWidth - キャンバスの幅
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    constructor(rows, cols, canvasWidth, ctx) {
        this.rows = rows;
        this.cols = cols;
        this.bricks = [];
        this.ctx = ctx;
        
        // ブロックのサイズを計算
        const padding = 8; // ブロック間のパディング
        this.brickWidth = (canvasWidth - padding * (cols + 1)) / cols;
        this.brickHeight = 25;
        
        // ブロックの色とポイントの設定
        this.colors = [
            '#FF3D7F', // 赤 - 1行目
            '#FF9E00', // オレンジ - 2行目
            '#FFFF00', // 黄色 - 3行目
            '#7CFF01', // 緑 - 4行目
            '#00CCFF', // 青 - 5行目
            '#8B61FF'  // 紫 - 6行目
        ];
        
        // ブロックの得点（上の行ほど高得点）
        this.rowPoints = [15, 12, 10, 8, 5, 3];
        
        this.createBricks();
    }

    /**
     * ブロックを生成
     */
    createBricks() {
        this.bricks = [];
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const padding = 8;
                const x = (c * (this.brickWidth + padding)) + padding;
                const y = (r * (this.brickHeight + padding)) + padding + 200; // 上部余白を4倍に増やして距離をさらに広げる
                
                // 行に応じた色とポイントを取得
                const colorIndex = r % this.colors.length;
                const color = this.colors[colorIndex];
                const points = this.rowPoints[colorIndex];
                
                this.bricks.push(new Brick(x, y, this.brickWidth, this.brickHeight, color, points, this.ctx));
            }
        }
    }

    /**
     * すべてのブロックを描画
     */
    drawBricks() {
        this.bricks.forEach(brick => brick.draw());
    }

    /**
     * 残っているブロックの数を取得
     * @returns {number} - 残っているブロックの数
     */
    getRemainingBricks() {
        return this.bricks.filter(brick => brick.isVisible).length;
    }

    /**
     * すべてのブロックを表示状態に戻す（リセット用）
     */
    resetBricks() {
        this.bricks.forEach(brick => brick.isVisible = true);
    }
}
