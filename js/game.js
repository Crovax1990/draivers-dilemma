/**
 * DRAIVER'S DILEMMA - GAME CONTROLLER
 * Main game state management and orchestration
 */

class Game {
    /**
     * Create game instance
     */
    constructor() {
        this.board = new Board();
        this.levelManager = new LevelManager();
        this.renderer = null;
        this.inputHandler = null;

        this.gameState = 'loading'; // 'loading'|'playing'|'paused'|'won'
        this.moveHistory = [];
        this.moveCount = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;

        this.currentLevelData = null;
    }

    /**
     * Initialize the game
     */
    async initialize() {
        // Setup renderer
        const boardElement = document.getElementById('game-board');
        this.renderer = new Renderer(boardElement);
        this.renderer.initializeBoard();

        // Setup input handler
        this.inputHandler = new InputHandler(this, this.renderer);
        this.inputHandler.setupListeners();

        // Load levels
        await this.levelManager.loadLevels();

        // Load first level
        this.loadCurrentLevel();

        // Update UI
        this._updateUI();

        this.gameState = 'playing';
        this._startTimer();

        console.log('Game initialized!');
    }

    /**
     * Load current level from level manager
     */
    loadCurrentLevel() {
        const levelData = this.levelManager.getCurrentLevel();
        if (!levelData) {
            console.error('No level data available');
            return;
        }

        this.loadLevel(levelData);
    }

    /**
     * Load a specific level
     * @param {Object} levelData - Level data
     */
    loadLevel(levelData) {
        this.currentLevelData = levelData;
        this.moveHistory = [];
        this.moveCount = 0;
        this.elapsedTime = 0;

        // Reset board
        this.board = new Board();

        // Add vehicles
        levelData.vehicles.forEach(vehicleData => {
            const vehicle = Vehicle.fromJSON(vehicleData);
            this.board.addVehicle(vehicle);
        });

        // Render
        this.renderer.clear();
        this.renderer.renderBoard(this.board);

        // Update UI
        this._updateUI();

        this.gameState = 'playing';
        this._startTimer();
    }

    /**
     * Handle a move attempt
     * @param {string} vehicleId - Vehicle ID
     * @param {'up'|'down'|'left'|'right'} direction - Direction
     * @param {number} distance - Distance to move
     * @returns {boolean} True if move was successful
     */
    handleMove(vehicleId, direction, distance = 1) {
        if (this.gameState !== 'playing') {
            return false;
        }

        const vehicle = this.board.getVehicle(vehicleId);
        if (!vehicle) {
            return false;
        }

        // Try to move
        if (!this.board.canMoveVehicle(vehicleId, direction, distance)) {
            // Invalid move - visual feedback could go here
            return false;
        }

        // Save state for undo
        this.moveHistory.push({
            vehicleId,
            direction,
            distance,
            timestamp: Date.now()
        });

        // Execute move
        this.board.moveVehicle(vehicleId, direction, distance);
        this.moveCount++;

        // Animate
        this.renderer.animateVehicleMove(vehicle);

        // Update UI
        this.renderer.updateMoveCounter(this.moveCount);
        this._updateUndoButton();

        // Check win condition
        if (this.board.checkWinCondition()) {
            this._handleWin();
        }

        return true;
    }

    /**
     * Undo last move
     */
    undo() {
        if (this.moveHistory.length === 0 || this.gameState !== 'playing') {
            return;
        }

        const lastMove = this.moveHistory.pop();
        const oppositeDirection = Vehicle.getOppositeDirection(lastMove.direction);

        // Move vehicle back
        const vehicle = this.board.getVehicle(lastMove.vehicleId);
        if (vehicle) {
            this.board.moveVehicle(lastMove.vehicleId, oppositeDirection, lastMove.distance);
            this.renderer.animateVehicleMove(vehicle);
        }

        // Don't decrement move count for undo (keep track of total moves including undos)

        this._updateUndoButton();
    }

    /**
     * Reset current level
     */
    reset() {
        if (!this.currentLevelData) return;

        this.loadLevel(this.currentLevelData);
        this.renderer.deselectAll();
    }

    /**
     * Load next level
     */
    nextLevel() {
        const nextLevel = this.levelManager.nextLevel();
        if (nextLevel) {
            this.loadLevel(nextLevel);
        } else {
            alert('Congratulations! You completed all levels!');
        }
    }

    /**
     * Load previous level
     */
    previousLevel() {
        const prevLevel = this.levelManager.previousLevel();
        if (prevLevel) {
            this.loadLevel(prevLevel);
        }
    }

    /**
     * Show hint (simple implementation)
     */
    showHint() {
        // Simple hint: highlight a vehicle that can move
        const vehicles = this.board.getAllVehicles();
        const directions = ['up', 'down', 'left', 'right'];

        for (const vehicle of vehicles) {
            for (const direction of directions) {
                if (vehicle.canMove(direction, this.board, 1)) {
                    this.renderer.selectVehicle(vehicle.id);

                    // Flash the vehicle
                    setTimeout(() => {
                        this.renderer.deselectAll();
                    }, 1000);

                    return;
                }
            }
        }

        alert('No obvious moves available - keep trying!');
    }

    /**
     * Handle win condition
     * @private
     */
    _handleWin() {
        this.gameState = 'won';
        this._stopTimer();

        // Save progress
        this.levelManager.completeLevel(
            this.currentLevelData.id,
            this.moveCount,
            this.elapsedTime
        );

        // Show win modal
        setTimeout(() => {
            this.renderer.showWinModal(
                this.moveCount,
                this.elapsedTime,
                this.currentLevelData.minMoves
            );
        }, 500); // Delay for animation to complete
    }

    /**
     * Start game timer
     * @private
     */
    _startTimer() {
        this._stopTimer();
        this.startTime = Date.now();

        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.renderer.updateTimer(this.elapsedTime);
        }, 1000);
    }

    /**
     * Stop game timer
     * @private
     */
    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Update all UI elements
     * @private
     */
    _updateUI() {
        const levelIndex = this.levelManager.getCurrentLevelIndex();
        const totalLevels = this.levelManager.getTotalLevels();

        this.renderer.updateLevelDisplay(levelIndex + 1, totalLevels);
        this.renderer.updateDifficultyBadge(this.currentLevelData?.difficulty || 'easy');
        this.renderer.updateMoveCounter(this.moveCount);
        this.renderer.updateTimer(this.elapsedTime);

        // Update best moves
        const progress = this.levelManager.getLevelProgress(this.currentLevelData?.id);
        this.renderer.updateBestMoves(progress?.bestMoves || null);

        this._updateUndoButton();
        this._updateLevelNavButtons();
    }

    /**
     * Update undo button state
     * @private
     */
    _updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = this.moveHistory.length === 0;
        }
    }

    /**
     * Update level navigation buttons
     * @private
     */
    _updateLevelNavButtons() {
        const prevBtn = document.getElementById('prev-level');
        const nextBtn = document.getElementById('next-level');

        if (prevBtn) {
            prevBtn.disabled = this.levelManager.getCurrentLevelIndex() === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.levelManager.getCurrentLevelIndex() >= this.levelManager.getTotalLevels() - 1;
        }
    }
}
