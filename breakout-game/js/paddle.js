/**
 * パドルクラス
 * プレイヤーが操作するパドルの動きと描画を管理
 */
class Paddle {
    /**
     * パドルの初期化
     * @param {number} width - パドルの幅
     * @param {number} height - パドルの高さ
     * @param {number} canvasWidth - キャンバスの幅
     * @param {number} canvasHeight - キャンバスの高さ
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    constructor(width, height, canvasWidth, canvasHeight, ctx) {
        this.width = width;
        this.height = height;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.ctx = ctx;
        
        // パドルの位置
        this.x = (canvasWidth - width) / 2;
        this.y = canvasHeight - height - 10; // キャンバスの下部から少し上に配置
        
        this.speed = 8; // パドルの移動速度
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }

    /**
     * パドルを描画
     */
    draw() {
        this.ctx.beginPath();
        
        // グラデーション背景
        const gradient = this.ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#4facfe');
        gradient.addColorStop(1, '#00f2fe');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // パドルの上面に光沢効果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 3);
        
        // パドルのエッジに影効果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(this.x, this.y + this.height - 2, this.width, 2);
        
        this.ctx.closePath();
    }

    /**
     * パドルを移動
     */
    move() {
        if (this.isMovingLeft) {
            this.x = Math.max(0, this.x - this.speed);
        }
        
        if (this.isMovingRight) {
            this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed);
        }
    }

    /**
     * マウスでパドルを操作
     * @param {number} mouseX - マウスのX座標
     */
    moveWithMouse(mouseX) {
        const paddleCenter = this.width / 2;
        this.x = Math.min(Math.max(mouseX - paddleCenter, 0), this.canvasWidth - this.width);
    }

    /**
     * パドル位置をリセット
     */
    reset() {
        this.x = (this.canvasWidth - this.width) / 2;
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }
}
