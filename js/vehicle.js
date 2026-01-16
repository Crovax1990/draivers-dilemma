/**
 * DRAIVER'S DILEMMA - VEHICLE CLASS
 * Represents a single vehicle on the game board
 */

class Vehicle {
    /**
     * Create a vehicle
     * @param {string} id - Unique identifier
     * @param {'horizontal'|'vertical'} orientation - Vehicle orientation
     * @param {number} length - Vehicle length (2 or 3 cells)
     * @param {{row: number, col: number}} position - Top-left grid position
     * @param {boolean} isPlayer - Whether this is the player's vehicle
     */
    constructor(id, orientation, length, position, isPlayer = false) {
        this.id = id;
        this.orientation = orientation;
        this.length = length;
        this.position = { ...position }; // Clone to avoid reference issues
        this.isPlayer = isPlayer;
        this.color = null; // Set by renderer
        this.element = null; // DOM element, set by renderer
    }

    /**
     * Check if the vehicle can move in a given direction
     * @param {'up'|'down'|'left'|'right'} direction - Direction to move
     * @param {Board} board - Game board instance
     * @param {number} distance - Distance to move (default 1)
     * @returns {boolean} True if move is valid
     */
    canMove(direction, board, distance = 1) {
        // Horizontal vehicles can only move left/right
        if (this.orientation === 'horizontal' && (direction === 'up' || direction === 'down')) {
            return false;
        }

        // Vertical vehicles can only move up/down
        if (this.orientation === 'vertical' && (direction === 'left' || direction === 'right')) {
            return false;
        }

        // Calculate new position
        const newPos = { ...this.position };
        switch (direction) {
            case 'up':
                newPos.row -= distance;
                break;
            case 'down':
                newPos.row += distance;
                break;
            case 'left':
                newPos.col -= distance;
                break;
            case 'right':
                newPos.col += distance;
                break;
        }

        // Check if all cells in new position are valid
        const newCells = this._calculateOccupiedCells(newPos);

        for (const cell of newCells) {
            // Check bounds
            if (cell.row < 0 || cell.row >= board.height ||
                cell.col < 0 || cell.col >= board.width) {
                return false;
            }

            // Check collision with other vehicles
            const occupyingVehicle = board.getVehicleAt(cell.row, cell.col);
            if (occupyingVehicle && occupyingVehicle.id !== this.id) {
                return false;
            }
        }

        return true;
    }

    /**
     * Move the vehicle
     * @param {'up'|'down'|'left'|'right'} direction - Direction to move
     * @param {number} distance - Distance to move (default 1)
     */
    move(direction, distance = 1) {
        switch (direction) {
            case 'up':
                this.position.row -= distance;
                break;
            case 'down':
                this.position.row += distance;
                break;
            case 'left':
                this.position.col -= distance;
                break;
            case 'right':
                this.position.col += distance;
                break;
        }
    }

    /**
     * Get all cells occupied by this vehicle
     * @returns {Array<{row: number, col: number}>} Array of occupied cells
     */
    getOccupiedCells() {
        return this._calculateOccupiedCells(this.position);
    }

    /**
     * Calculate occupied cells for a given position
     * @private
     * @param {{row: number, col: number}} position - Position to calculate from
     * @returns {Array<{row: number, col: number}>} Array of cells
     */
    _calculateOccupiedCells(position) {
        const cells = [];

        if (this.orientation === 'horizontal') {
            for (let i = 0; i < this.length; i++) {
                cells.push({ row: position.row, col: position.col + i });
            }
        } else {
            for (let i = 0; i < this.length; i++) {
                cells.push({ row: position.row + i, col: position.col });
            }
        }

        return cells;
    }

    /**
     * Get the opposite direction
     * @param {'up'|'down'|'left'|'right'} direction - Original direction
     * @returns {'up'|'down'|'left'|'right'} Opposite direction
     */
    static getOppositeDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction];
    }

    /**
     * Convert direction to delta
     * @param {'up'|'down'|'left'|'right'} direction - Direction
     * @returns {{row: number, col: number}} Delta values
     */
    static directionToDelta(direction) {
        const deltas = {
            'up': { row: -1, col: 0 },
            'down': { row: 1, col: 0 },
            'left': { row: 0, col: -1 },
            'right': { row: 0, col: 1 }
        };
        return deltas[direction];
    }

    /**
     * Serialize vehicle to JSON
     * @returns {Object} Vehicle data
     */
    toJSON() {
        return {
            id: this.id,
            orientation: this.orientation,
            length: this.length,
            position: { ...this.position },
            isPlayer: this.isPlayer
        };
    }

    /**
     * Create vehicle from JSON data
     * @param {Object} data - Vehicle data
     * @returns {Vehicle} New vehicle instance
     */
    static fromJSON(data) {
        return new Vehicle(
            data.id,
            data.orientation,
            data.length,
            data.position,
            data.isPlayer
        );
    }

    /**
     * Clone this vehicle
     * @returns {Vehicle} Cloned vehicle
     */
    clone() {
        return new Vehicle(
            this.id,
            this.orientation,
            this.length,
            { ...this.position },
            this.isPlayer
        );
    }
}
