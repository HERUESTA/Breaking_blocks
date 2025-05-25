/**
 * ボールクラス
 * ゲーム内のボールの動きと描画を管理
 */
class Ball {
    /**
     * ボールの初期化
     * @param {number} x - ボールのX座標
     * @param {number} y - ボールのY座標
     * @param {number} radius - ボールの半径
     * @param {number} speed - ボールの移動速度
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    constructor(x, y, radius, speed, ctx) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.dx = speed; // X方向の速度
        this.dy = -speed; // Y方向の速度（初期は上方向）
        this.ctx = ctx;
        this.originalSpeed = speed; // 元の速度を保存
    }

    /**
     * ボールを描画
     */
    draw() {
        this.ctx.beginPath();
        
        // グラデーション効果を作成
        const gradient = this.ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.8, 'rgba(220, 220, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 200, 255, 0.6)');
        
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 光沢効果
        this.ctx.beginPath();
        this.ctx.arc(this.x - this.radius/3, this.y - this.radius/3, this.radius/4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
        
        this.ctx.closePath();
    }

    /**
     * ボールを移動
     * @param {number} canvasWidth - キャンバスの幅
     * @param {number} canvasHeight - キャンバスの高さ
     * @returns {boolean} - ボールが下部に落ちたかどうか
     */
    move(canvasWidth, canvasHeight) {
        this.x += this.dx;
        this.y += this.dy;

        // 左右の壁との衝突
        if (this.x + this.radius > canvasWidth || this.x - this.radius < 0) {
            this.dx = -this.dx;
            // 衝突効果音を再生（実装時に追加）
        }

        // 上の壁との衝突
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
            // 衝突効果音を再生（実装時に追加）
        }

        // 下部に落ちた場合
        if (this.y + this.radius > canvasHeight) {
            return true; // ボールがキャンバス下部に落ちた
        }

        return false;
    }

    /**
     * ボールをリセット
     * @param {number} x - リセット時のX座標
     * @param {number} y - リセット時のY座標
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.speed = this.originalSpeed;
        
        // ランダムな方向に発射（真下以外）
        const angle = Math.random() * Math.PI - Math.PI/2; // -90度〜+90度
        this.dx = this.speed * Math.cos(angle);
        this.dy = -this.speed * Math.abs(Math.sin(angle)); // 上方向に打ち出す
    }

    /**
     * ボールの速度を変更
     * @param {number} percent - 現在の速度からの変化率
     */
    changeSpeed(percent) {
        const newSpeed = this.originalSpeed * (1 + percent / 100);
        const speedFactor = newSpeed / Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.dx *= speedFactor;
        this.dy *= speedFactor;
    }

    /**
     * パドルとの衝突後の角度を調整
     * @param {number} paddleX - パドルのX座標
     * @param {number} paddleWidth - パドルの幅
     */
    adjustAngleAfterPaddleCollision(paddleX, paddleWidth) {
        // パドルのどの位置に当たったかを計算（-1.0〜1.0の範囲）
        const hitPosition = (this.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        
        // 反射角度を計算（-60度〜+60度）
        const angle = hitPosition * Math.PI/3;
        
        // ボールの速さを保持しつつ、方向を変更
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.dx = speed * Math.sin(angle);
        this.dy = -speed * Math.cos(angle);
    }
}
