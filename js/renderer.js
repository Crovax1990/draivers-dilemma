/**
 * DRAIVER'S DILEMMA - RENDERER
 * Handles visual rendering and animations
 */

class Renderer {
    /**
     * Create renderer
     * @param {HTMLElement} boardElement - Game board DOM element
     */
    constructor(boardElement) {
        this.boardElement = boardElement;
        this.vehicleElements = new Map(); // vehicleId -> HTMLElement
        this.cellSize = 0;
        this.gridGap = 0;
        this._updateDimensions();
    }

    /**
     * Update cached dimensions
     * @private
     */
    _updateDimensions() {
        const styles = getComputedStyle(document.documentElement);
        this.cellSize = parseInt(styles.getPropertyValue('--cell-size'));
        this.gridGap = parseInt(styles.getPropertyValue('--grid-gap'));
    }

    /**
     * Initialize board grid cells
     */
    initializeBoard() {
        // Create grid cells for visual reference
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.gridRow = row + 1;
                cell.style.gridColumn = col + 1;
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.boardElement.appendChild(cell);
            }
        }
    }

    /**
     * Render entire board
     * @param {Board} board - Game board instance
     */
    renderBoard(board) {
        this._updateDimensions();

        // Remove vehicles that no longer exist
        for (const [id, element] of this.vehicleElements) {
            if (!board.getVehicle(id)) {
                element.remove();
                this.vehicleElements.delete(id);
            }
        }

        // Render all vehicles
        const vehicles = board.getAllVehicles();
        vehicles.forEach((vehicle, index) => {
            this.renderVehicle(vehicle, index);
        });
    }

    /**
     * Render a single vehicle
     * @param {Vehicle} vehicle - Vehicle to render
     * @param {number} colorIndex - Index for color selection
     */
    renderVehicle(vehicle, colorIndex = 0) {
        let element = this.vehicleElements.get(vehicle.id);

        // Create element if it doesn't exist
        if (!element) {
            element = document.createElement('div');
            element.className = 'vehicle';
            element.dataset.vehicleId = vehicle.id;
            element.dataset.orientation = vehicle.orientation;

            // Add truck class for 3-cell vehicles
            if (vehicle.length === 3) {
                element.classList.add('truck');
            }

            // Add emoji icons based on vehicle type
            if (vehicle.isPlayer) {
                element.classList.add('player');
                element.textContent = '🚗';
            } else {
                // Different icons for cars vs trucks
                if (vehicle.length === 3) {
                    // Trucks get truck emoji
                    element.textContent = '🚚';
                } else {
                    // Cars get car emoji - variety for visual interest
                    const carIcons = ['🚙', '🚕', '🚐'];
                    element.textContent = carIcons[colorIndex % carIcons.length];
                }
            }

            this.boardElement.appendChild(element);
            this.vehicleElements.set(vehicle.id, element);
            vehicle.element = element;
        }

        // Set color
        if (!vehicle.color) {
            vehicle.color = getVehicleColor(colorIndex, vehicle.isPlayer);
        }

        if (!vehicle.isPlayer) {
            element.style.background = `linear-gradient(135deg, ${vehicle.color} 0%, ${this._darkenColor(vehicle.color)} 100%)`;
        }

        // Set size and position
        this._updateVehicleTransform(vehicle);
    }

    /**
     * Update vehicle visual position
     * @param {Vehicle} vehicle - Vehicle to update
     * @param {boolean} animate - Whether to animate (default true)
     */
    _updateVehicleTransform(vehicle, animate = true) {
        const element = vehicle.element;
        if (!element) return;

        const x = gridToPixel(vehicle.position.col);
        const y = gridToPixel(vehicle.position.row);

        if (vehicle.orientation === 'horizontal') {
            const width = vehicle.length * this.cellSize + (vehicle.length - 1) * this.gridGap;
            element.style.width = `${width}px`;
            element.style.height = `${this.cellSize}px`;
        } else {
            const height = vehicle.length * this.cellSize + (vehicle.length - 1) * this.gridGap;
            element.style.width = `${this.cellSize}px`;
            element.style.height = `${height}px`;
        }

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    /**
     * Animate vehicle movement
     * @param {Vehicle} vehicle - Vehicle to animate
     * @returns {Promise} Resolves when animation completes
     */
    async animateVehicleMove(vehicle) {
        return new Promise(resolve => {
            this._updateVehicleTransform(vehicle, true);
            setTimeout(resolve, 300); // Match CSS transition duration
        });
    }

    /**
     * Select a vehicle (visual highlight)
     * @param {string} vehicleId - Vehicle ID to select
     */
    selectVehicle(vehicleId) {
        // Deselect all
        this.vehicleElements.forEach(element => {
            element.classList.remove('selected');
        });

        // Select specified vehicle
        const element = this.vehicleElements.get(vehicleId);
        if (element) {
            element.classList.add('selected');
        }
    }

    /**
     * Deselect all vehicles
     */
    deselectAll() {
        this.vehicleElements.forEach(element => {
            element.classList.remove('selected');
        });
    }

    /**
     * Update move counter display
     * @param {number} count - Move count
     */
    updateMoveCounter(count) {
        const element = document.getElementById('move-count');
        if (element) {
            element.textContent = count;
        }
    }

    /**
     * Update best moves display
     * @param {number} moves - Best moves
     */
    updateBestMoves(moves) {
        const element = document.getElementById('best-moves');
        if (element) {
            element.textContent = moves !== null ? moves : '-';
        }
    }

    /**
     * Update timer display
     * @param {number} seconds - Elapsed seconds
     */
    updateTimer(seconds) {
        const element = document.getElementById('timer');
        if (element) {
            element.textContent = formatTime(seconds);
        }
    }

    /**
     * Update level display
     * @param {number} current - Current level (1-based)
     * @param {number} total - Total levels
     */
    updateLevelDisplay(current, total) {
        const currentElement = document.getElementById('current-level');
        const totalElement = document.getElementById('total-levels');

        if (currentElement) currentElement.textContent = current;
        if (totalElement) totalElement.textContent = total;
    }

    /**
     * Update difficulty badge
     * @param {string} difficulty - Difficulty level ('easy'|'medium'|'hard')
     */
    updateDifficultyBadge(difficulty) {
        const badge = document.getElementById('difficulty-badge');
        if (badge) {
            badge.className = `difficulty-badge ${difficulty}`;
            badge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }
    }

    /**
     * Show win modal
     * @param {number} moves - Moves taken
     * @param {number} time - Time in seconds
     * @param {number} optimalMoves - Optimal moves
     */
    showWinModal(moves, time, optimalMoves) {
        const modal = document.getElementById('win-modal');
        const finalMoves = document.getElementById('final-moves');
        const finalTime = document.getElementById('final-time');
        const optimalElement = document.getElementById('optimal-moves');
        const rating = document.getElementById('performance-rating');

        if (finalMoves) finalMoves.textContent = moves;
        if (finalTime) finalTime.textContent = formatTime(time);
        if (optimalElement) optimalElement.textContent = optimalMoves;

        // Show star rating
        if (rating) {
            const stars = calculateStars(moves, optimalMoves);
            rating.innerHTML = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        }

        if (modal) {
            modal.showModal();
        }

        // Celebrate!
        celebrateWin();
    }

    /**
     * Hide win modal
     */
    hideWinModal() {
        const modal = document.getElementById('win-modal');
        if (modal) {
            modal.close();
        }
    }

    /**
     * Show instructions modal
     */
    showInstructionsModal() {
        const modal = document.getElementById('instructions-modal');
        if (modal) {
            modal.showModal();
        }
    }

    /**
     * Hide instructions modal
     */
    hideInstructionsModal() {
        const modal = document.getElementById('instructions-modal');
        if (modal) {
            modal.close();
        }
    }

    /**
     * Darken a color (for gradients)
     * @private
     * @param {string} color - Hex color
     * @returns {string} Darkened color
     */
    _darkenColor(color) {
        // Simple darkening by reducing RGB values
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Clear all vehicle elements
     */
    clear() {
        this.vehicleElements.forEach(element => element.remove());
        this.vehicleElements.clear();
    }
}
