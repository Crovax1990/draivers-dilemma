/**
 * DRAIVER'S DILEMMA - INPUT HANDLER
 * Manages user input (mouse, keyboard, touch)
 */

class InputHandler {
    /**
     * Create input handler
     * @param {Game} game - Game instance
     * @param {Renderer} renderer - Renderer instance
     */
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;
        this.selectedVehicle = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragInitialPos = { row: 0, col: 0 };
    }

    /**
     * Setup all event listeners
     */
    setupListeners() {
        // Mouse events
        this.renderer.boardElement.addEventListener('mousedown', this._handleMouseDown.bind(this));
        document.addEventListener('mousemove', this._handleMouseMove.bind(this));
        document.addEventListener('mouseup', this._handleMouseUp.bind(this));

        // Touch events
        this.renderer.boardElement.addEventListener('touchstart', this._handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this._handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this._handleTouchEnd.bind(this));

        // Keyboard events
        document.addEventListener('keydown', this._handleKeyDown.bind(this));

        // Control buttons
        document.getElementById('undo-btn')?.addEventListener('click', () => this.game.undo());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.game.reset());
        document.getElementById('hint-btn')?.addEventListener('click', () => this.game.showHint());

        // Level navigation
        document.getElementById('prev-level')?.addEventListener('click', () => this.game.previousLevel());
        document.getElementById('next-level')?.addEventListener('click', () => this.game.nextLevel());

        // Modal buttons
        document.getElementById('next-level-btn')?.addEventListener('click', () => {
            this.renderer.hideWinModal();
            this.game.nextLevel();
        });

        document.getElementById('retry-btn')?.addEventListener('click', () => {
            this.renderer.hideWinModal();
            this.game.reset();
        });

        document.getElementById('close-modal-btn')?.addEventListener('click', () => {
            this.renderer.hideWinModal();
        });

        // Instructions
        document.getElementById('instructions-btn')?.addEventListener('click', () => {
            this.renderer.showInstructionsModal();
        });

        document.getElementById('close-instructions-btn')?.addEventListener('click', () => {
            this.renderer.hideInstructionsModal();
        });
    }

    /**
     * Handle mouse down
     * @private
     */
    _handleMouseDown(event) {
        if (this.game.gameState !== 'playing') return;

        const target = event.target.closest('.vehicle');
        if (!target) return;

        const vehicleId = target.dataset.vehicleId;
        const vehicle = this.game.board.getVehicle(vehicleId);

        if (!vehicle) return;

        this.selectedVehicle = vehicle;
        this.isDragging = true;
        this.dragStart = { x: event.clientX, y: event.clientY };
        this.dragInitialPos = { ...vehicle.position };

        target.classList.add('dragging');
        this.renderer.selectVehicle(vehicleId);

        event.preventDefault();
    }

    /**
     * Handle mouse move
     * @private
     */
    _handleMouseMove(event) {
        if (!this.isDragging || !this.selectedVehicle) return;

        const deltaX = event.clientX - this.dragStart.x;
        const deltaY = event.clientY - this.dragStart.y;

        this._handleDrag(deltaX, deltaY);
    }

    /**
     * Handle mouse up
     * @private
     */
    _handleMouseUp() {
        if (!this.isDragging || !this.selectedVehicle) return;

        const element = this.selectedVehicle.element;
        if (element) {
            element.classList.remove('dragging');
        }

        // Calculate final move
        this._finalizeMove();

        this.isDragging = false;
        this.selectedVehicle = null;
    }

    /**
     * Handle touch start
     * @private
     */
    _handleTouchStart(event) {
        if (this.game.gameState !== 'playing') return;

        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const vehicleElement = target?.closest('.vehicle');

        if (!vehicleElement) return;

        const vehicleId = vehicleElement.dataset.vehicleId;
        const vehicle = this.game.board.getVehicle(vehicleId);

        if (!vehicle) return;

        this.selectedVehicle = vehicle;
        this.isDragging = true;
        this.dragStart = { x: touch.clientX, y: touch.clientY };
        this.dragInitialPos = { ...vehicle.position };

        vehicleElement.classList.add('dragging');
        this.renderer.selectVehicle(vehicleId);

        event.preventDefault();
    }

    /**
     * Handle touch move
     * @private
     */
    _handleTouchMove(event) {
        if (!this.isDragging || !this.selectedVehicle) return;

        const touch = event.touches[0];
        const deltaX = touch.clientX - this.dragStart.x;
        const deltaY = touch.clientY - this.dragStart.y;

        this._handleDrag(deltaX, deltaY);
        event.preventDefault();
    }

    /**
     * Handle touch end
     * @private
     */
    _handleTouchEnd() {
        if (!this.isDragging || !this.selectedVehicle) return;

        const element = this.selectedVehicle.element;
        if (element) {
            element.classList.remove('dragging');
        }

        this._finalizeMove();

        this.isDragging = false;
        this.selectedVehicle = null;
    }

    /**
     * Handle drag movement
     * @private
     */
    _handleDrag(deltaX, deltaY) {
        if (!this.selectedVehicle) return;

        const cellSize = this.renderer.cellSize + this.renderer.gridGap;

        if (this.selectedVehicle.orientation === 'horizontal') {
            // Horizontal movement
            const gridDelta = Math.round(deltaX / cellSize);
            const newCol = clamp(this.dragInitialPos.col + gridDelta, 0, 6 - this.selectedVehicle.length);

            // Visual update (doesn't affect game state yet)
            this.selectedVehicle.element.style.left = `${gridToPixel(newCol)}px`;
        } else {
            // Vertical movement
            const gridDelta = Math.round(deltaY / cellSize);
            const newRow = clamp(this.dragInitialPos.row + gridDelta, 0, 6 - this.selectedVehicle.length);

            // Visual update
            this.selectedVehicle.element.style.top = `${gridToPixel(newRow)}px`;
        }
    }

    /**
     * Finalize drag movement
     * @private
     */
    _finalizeMove() {
        if (!this.selectedVehicle) return;

        // Calculate how far the vehicle moved
        const rowDelta = this.selectedVehicle.position.row - this.dragInitialPos.row;
        const colDelta = this.selectedVehicle.position.col - this.dragInitialPos.col;

        // Determine direction and distance from visual position
        const element = this.selectedVehicle.element;
        const currentLeft = parseInt(element.style.left);
        const currentTop = parseInt(element.style.top);

        const newCol = pixelToGrid(currentLeft);
        const newRow = pixelToGrid(currentTop);

        const actualColDelta = newCol - this.dragInitialPos.col;
        const actualRowDelta = newRow - this.dragInitialPos.row;

        // Reset position first
        this.selectedVehicle.position = { ...this.dragInitialPos };
        this.renderer._updateVehicleTransform(this.selectedVehicle, false);

        // Execute move through game logic
        if (actualColDelta !== 0) {
            const direction = actualColDelta > 0 ? 'right' : 'left';
            const distance = Math.abs(actualColDelta);
            this.game.handleMove(this.selectedVehicle.id, direction, distance);
        } else if (actualRowDelta !== 0) {
            const direction = actualRowDelta > 0 ? 'down' : 'up';
            const distance = Math.abs(actualRowDelta);
            this.game.handleMove(this.selectedVehicle.id, direction, distance);
        } else {
            // No move, just deselect
            this.renderer.deselectAll();
        }
    }

    /**
     * Handle keyboard input
     * @private
     */
    _handleKeyDown(event) {
        if (this.game.gameState !== 'playing') return;

        // Don't process if typing in input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this._moveSelected('up');
                event.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                this._moveSelected('down');
                event.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                this._moveSelected('left');
                event.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                this._moveSelected('right');
                event.preventDefault();
                break;
            case 'u':
                this.game.undo();
                event.preventDefault();
                break;
            case 'r':
                this.game.reset();
                event.preventDefault();
                break;
            case 'h':
                this.game.showHint();
                event.preventDefault();
                break;
            case ' ':
                // Space to select/deselect
                event.preventDefault();
                break;
        }
    }

    /**
     * Move selected vehicle
     * @private
     */
    _moveSelected(direction) {
        // If no vehicle selected, select player
        if (!this.selectedVehicle) {
            const player = this.game.board.getPlayerVehicle();
            if (player) {
                this.selectedVehicle = player;
                this.renderer.selectVehicle(player.id);
            }
        }

        if (this.selectedVehicle) {
            this.game.handleMove(this.selectedVehicle.id, direction, 1);
        }
    }
}
