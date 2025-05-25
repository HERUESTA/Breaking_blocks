/**
 * 衝突検出クラス
 * ゲーム内の各要素間の衝突を検出する
 */
class CollisionDetector {
    /**
     * 衝突検出の初期化
     * @param {Ball} ball - ボールオブジェクト
     * @param {Paddle} paddle - パドルオブジェクト
     * @param {BrickManager} brickManager - ブリックマネージャーオブジェクト
     */
    constructor(ball, paddle, brickManager) {
        this.ball = ball;
        this.paddle = paddle;
        this.brickManager = brickManager;
    }

    /**
     * ボールとパドルの衝突を検出
     * @returns {boolean} - 衝突したかどうか
     */
    checkPaddleCollision() {
        const ball = this.ball;
        const paddle = this.paddle;
        
        // ボールがパドルの高さにあるか
        if (ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height) {
            
            // ボールがパドルの幅の範囲内にあるか
            if (ball.x + ball.radius >= paddle.x &&
                ball.x - ball.radius <= paddle.x + paddle.width) {
                
                // パドルとの衝突位置に基づいて反射角度を調整
                ball.adjustAngleAfterPaddleCollision(paddle.x, paddle.width);
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * ボールとブロックの衝突を検出
     * @returns {{collision: boolean, points: number}} - 衝突情報と得点
     */
    checkBrickCollision() {
        const ball = this.ball;
        let collisionResult = {
            collision: false,
            points: 0
        };
        
        // すべての表示中のブロックに対してチェック
        for (let i = 0; i < this.brickManager.bricks.length; i++) {
            const brick = this.brickManager.bricks[i];
            
            if (brick.isVisible) {
                const collision = this.checkCircleRectCollision(
                    ball.x, ball.y, ball.radius,
                    brick.x, brick.y, brick.width, brick.height
                );
                
                if (collision.collision) {
                    brick.isVisible = false; // ブロックを非表示に
                    collisionResult.collision = true;
                    collisionResult.points = brick.points;
                    
                    // 衝突面に基づいてボールの方向を反転
                    if (collision.side === 'left' || collision.side === 'right') {
                        ball.dx = -ball.dx; // 左右の衝突
                    } else {
                        ball.dy = -ball.dy; // 上下の衝突
                    }
                    
                    break; // 1フレームにつき1ブロックの衝突のみを処理
                }
            }
        }
        
        return collisionResult;
    }

    /**
     * 円と矩形の衝突検出（詳細な衝突面も判定）
     * @param {number} circleX - 円のX座標
     * @param {number} circleY - 円のY座標
     * @param {number} radius - 円の半径
     * @param {number} rectX - 矩形のX座標
     * @param {number} rectY - 矩形のY座標
     * @param {number} rectWidth - 矩形の幅
     * @param {number} rectHeight - 矩形の高さ
     * @returns {{collision: boolean, side: string}} - 衝突情報と衝突面
     */
    checkCircleRectCollision(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
        // 衝突検出の結果
        let result = {
            collision: false,
            side: ''
        };
        
        // 円の中心から矩形の最も近い点を見つける
        const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));
        
        // 円の中心と矩形の最も近い点の距離を計算
        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // 距離が円の半径より小さければ衝突している
        if (distance <= radius) {
            result.collision = true;
            
            // 衝突面を判定
            const centerX = rectX + rectWidth / 2;
            const centerY = rectY + rectHeight / 2;
            
            // 円の中心が矩形のどの面に最も近いかを判定
            const dx = Math.abs(circleX - centerX);
            const dy = Math.abs(circleY - centerY);
            
            if (dx / rectWidth > dy / rectHeight) {
                // 左右の辺との衝突
                result.side = (circleX < centerX) ? 'left' : 'right';
            } else {
                // 上下の辺との衝突
                result.side = (circleY < centerY) ? 'top' : 'bottom';
            }
        }
        
        return result;
    }
}
