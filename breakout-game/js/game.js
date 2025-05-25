/**
 * ブロック崩しゲームのメインクラス
 */
class BreakoutGame {
    constructor() {
        // Canvasの設定
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // ゲームの状態
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        this.score = 0;
        this.lives = 3;
        
        // ゲーム要素の初期化
        this.initializeGameElements();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // 初期画面描画
        this.drawStartScreen();
    }

    /**
     * キャンバスのリサイズ処理
     */
    resizeCanvas() {
        // キャンバスの高さを大きくして、より広いプレイエリアを確保
        const containerWidth = this.canvas.parentElement.clientWidth;
        const containerHeight = Math.min(window.innerHeight * 0.7, containerWidth * 3/4); // アスペクト比を変更して高さを増加
        
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
    }

    /**
     * ゲーム要素の初期化
     */
    initializeGameElements() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // パドルの初期化
        const paddleWidth = canvasWidth * 0.15;
        const paddleHeight = 15;
        this.paddle = new Paddle(paddleWidth, paddleHeight, canvasWidth, canvasHeight, this.ctx);
        
        // ボールの初期化
        const ballRadius = 8;
        const ballSpeed = 2.5; // 速度を半分に下げる
        const ballX = canvasWidth / 2;
        const ballY = canvasHeight - paddleHeight - ballRadius - 20; // ボールとパドルの間隔を広げる
        this.ball = new Ball(ballX, ballY, ballRadius, ballSpeed, this.ctx);
        
        // ブリックの初期化
        const brickRows = 6;
        const brickCols = Math.floor(canvasWidth / 80); // 画面幅に応じた列数
        this.brickManager = new BrickManager(brickRows, brickCols, canvasWidth, this.ctx);
        
        // 衝突検出の初期化
        this.collisionDetector = new CollisionDetector(this.ball, this.paddle, this.brickManager);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウリサイズイベント
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initializeGameElements();
            
            if (!this.gameStarted) {
                this.drawStartScreen();
            }
        });
        
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // マウスイベント
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // ボタンイベント
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }

    /**
     * キーダウンイベント処理
     */
    handleKeyDown(e) {
        if (this.gameStarted && !this.gamePaused) {
            if (e.key === 'ArrowLeft' || e.key === 'Left') {
                this.paddle.isMovingLeft = true;
            } else if (e.key === 'ArrowRight' || e.key === 'Right') {
                this.paddle.isMovingRight = true;
            }
        }
        
        // スペースキーでゲーム開始/一時停止切り替え
        if (e.key === ' ' || e.code === 'Space') {
            if (!this.gameStarted) {
                this.startGame();
            } else {
                this.togglePause();
            }
            e.preventDefault(); // スクロール防止
        }
    }

    /**
     * キーアップイベント処理
     */
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'Left') {
            this.paddle.isMovingLeft = false;
        } else if (e.key === 'ArrowRight' || e.key === 'Right') {
            this.paddle.isMovingRight = false;
        }
    }

    /**
     * マウス移動イベント処理
     */
    handleMouseMove(e) {
        if (this.gameStarted && !this.gamePaused) {
            const relativeX = e.clientX - this.canvas.getBoundingClientRect().left;
            this.paddle.moveWithMouse(relativeX);
        }
    }

    /**
     * ゲーム開始
     */
    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.gameOver = false;
            this.gameWon = false;
            this.score = 0;
            this.lives = 3;
            
            this.updateScore();
            this.updateLives();
            this.setMessage('');
            
            this.brickManager.resetBricks();
            this.gameLoop();
        } else if (this.gamePaused) {
            this.gamePaused = false;
            this.gameLoop();
        }
    }

    /**
     * ゲーム一時停止切り替え
     */
    togglePause() {
        if (!this.gameStarted) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.setMessage('一時停止中');
        } else {
            this.setMessage('');
            this.gameLoop();
        }
    }

    /**
     * ゲームリスタート
     */
    restartGame() {
        // ゲーム状態のリセット
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        
        // スコアと残機のリセット
        this.score = 0;
        this.lives = 3;
        
        // UI要素の更新
        this.updateScore();
        this.updateLives();
        this.setMessage('');
        
        // ゲーム要素のリセット
        this.initializeGameElements();
        
        // 開始画面の表示
        this.drawStartScreen();
    }

    /**
     * ゲームループ
     */
    gameLoop() {
        if (!this.gameStarted || this.gamePaused || this.gameOver || this.gameWon) return;
        
        // 画面クリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パドル移動
        this.paddle.move();
        
        // ボール移動
        const ballLost = this.ball.move(this.canvas.width, this.canvas.height);
        
        if (ballLost) {
            this.lives--;
            this.updateLives();
            
            if (this.lives <= 0) {
                this.gameOver = true;
                this.setMessage('ゲームオーバー! リスタートするには「リスタート」ボタンを押してください。');
                return;
            } else {
                // ボールとパドルをリセット
                this.ball.reset(this.canvas.width / 2, this.canvas.height - this.paddle.height - this.ball.radius - 20); // 距離を広げる
                this.paddle.reset();
                
                // 少し待ってからゲームを続行
                this.gamePaused = true;
                this.setMessage(`残り ${this.lives} 機! クリックして続行`);
                
                this.canvas.addEventListener('click', () => {
                    if (this.gamePaused && !this.gameOver && !this.gameWon) {
                        this.gamePaused = false;
                        this.setMessage('');
                        this.gameLoop();
                    }
                }, { once: true });
                
                return;
            }
        }
        
        // 衝突検出
        // パドルとの衝突
        this.collisionDetector.checkPaddleCollision();
        
        // ブロックとの衝突
        const brickCollision = this.collisionDetector.checkBrickCollision();
        if (brickCollision.collision) {
            // スコア加算
            this.score += brickCollision.points;
            this.updateScore();
            
            // レベルクリア判定
            if (this.brickManager.getRemainingBricks() === 0) {
                this.gameWon = true;
                this.setMessage('おめでとう! クリアしました! リスタートするには「リスタート」ボタンを押してください。');
                return;
            }
        }
        
        // 描画
        this.brickManager.drawBricks();
        this.paddle.draw();
        this.ball.draw();
        
        // 次のフレームを要求
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * 開始画面描画
     */
    drawStartScreen() {
        // 画面クリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // タイトル
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ブロック崩しゲーム', this.canvas.width / 2, this.canvas.height / 3);
        
        // 説明
        this.ctx.font = '16px Arial';
        this.ctx.fillText('「開始」ボタンを押すか、スペースキーを押してゲームを開始してください', 
                         this.canvas.width / 2, this.canvas.height / 2);
        
        // 操作説明
        this.ctx.font = '14px Arial';
        this.ctx.fillText('← → キー または マウスでパドルを操作', 
                         this.canvas.width / 2, this.canvas.height * 2/3);
                         
        // サンプルブロックとパドルを描画
        this.brickManager.drawBricks();
        this.paddle.draw();
    }

    /**
     * スコア更新
     */
    updateScore() {
        document.getElementById('score').innerText = this.score;
    }

    /**
     * 残機更新
     */
    updateLives() {
        document.getElementById('lives').innerText = `残機: ${this.lives}`;
    }

    /**
     * メッセージ設定
     */
    setMessage(message) {
        document.getElementById('message').innerText = message;
    }
}

// DOMが読み込まれた後にゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new BreakoutGame();
});
