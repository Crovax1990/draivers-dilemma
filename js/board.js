/**
 * DRAIVER'S DILEMMA - BOARD CLASS
 * Manages the game board state and vehicle positions
 */

class Board {
    /**
     * Create a game board
     * @param {number} width - Board width (default 6)
     * @param {number} height - Board height (default 6)
     */
    constructor(width = 6, height = 6) {
        this.width = width;
        this.height = height;
        this.vehicles = new Map(); // vehicleId -> Vehicle
        this.grid = this._createEmptyGrid();
        this.exitRow = 2; // Row 3 (0-indexed as 2)
        this.exitCol = 5; // Last column
    }

    /**
     * Create an empty grid
     * @private
     * @returns {Array<Array<string|null>>} Empty grid
     */
    _createEmptyGrid() {
        const grid = [];
        for (let row = 0; row < this.height; row++) {
            grid[row] = [];
            for (let col = 0; col < this.width; col++) {
                grid[row][col] = null; // null = empty cell
            }
        }
        return grid;
    }

    /**
     * Add a vehicle to the board
     * @param {Vehicle} vehicle - Vehicle to add
     * @returns {boolean} True if successfully added
     */
    addVehicle(vehicle) {
        // Check if vehicle already exists
        if (this.vehicles.has(vehicle.id)) {
            console.warn(`Vehicle ${vehicle.id} already exists`);
            return false;
        }

        // Check if all cells are available
        const cells = vehicle.getOccupiedCells();
        for (const cell of cells) {
            if (this.grid[cell.row][cell.col] !== null) {
                console.error(`Cell ${cell.row},${cell.col} is already occupied`);
                return false;
            }
        }

        // Add vehicle
        this.vehicles.set(vehicle.id, vehicle);
        this._updateGrid();
        return true;
    }

    /**
     * Remove a vehicle from the board
     * @param {string} vehicleId - ID of vehicle to remove
     * @returns {boolean} True if successfully removed
     */
    removeVehicle(vehicleId) {
        if (!this.vehicles.has(vehicleId)) {
            return false;
        }

        this.vehicles.delete(vehicleId);
        this._updateGrid();
        return true;
    }

    /**
     * Update grid based on current vehicle positions
     * @private
     */
    _updateGrid() {
        // Clear grid
        this.grid = this._createEmptyGrid();

        // Place all vehicles
        for (const [id, vehicle] of this.vehicles) {
            const cells = vehicle.getOccupiedCells();
            for (const cell of cells) {
                this.grid[cell.row][cell.col] = id;
            }
        }
    }

    /**
     * Check if a cell is occupied
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if occupied
     */
    isOccupied(row, col) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return true; // Out of bounds counts as occupied
        }
        return this.grid[row][col] !== null;
    }

    /**
     * Get vehicle at a specific cell
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Vehicle|null} Vehicle at cell or null
     */
    getVehicleAt(row, col) {
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return null;
        }

        const vehicleId = this.grid[row][col];
        return vehicleId ? this.vehicles.get(vehicleId) : null;
    }

    /**
     * Get vehicle by ID
     * @param {string} vehicleId - Vehicle ID
     * @returns {Vehicle|null} Vehicle or null
     */
    getVehicle(vehicleId) {
        return this.vehicles.get(vehicleId) || null;
    }

    /**
     * Get the player vehicle
     * @returns {Vehicle|null} Player vehicle or null
     */
    getPlayerVehicle() {
        for (const vehicle of this.vehicles.values()) {
            if (vehicle.isPlayer) {
                return vehicle;
            }
        }
        return null;
    }

    /**
     * Check if a move is valid
     * @param {string} vehicleId - Vehicle ID
     * @param {'up'|'down'|'left'|'right'} direction - Direction
     * @param {number} distance - Distance to move
     * @returns {boolean} True if move is valid
     */
    canMoveVehicle(vehicleId, direction, distance = 1) {
        const vehicle = this.vehicles.get(vehicleId);
        if (!vehicle) {
            return false;
        }

        return vehicle.canMove(direction, this, distance);
    }

    /**
     * Move a vehicle
     * @param {string} vehicleId - Vehicle ID
     * @param {'up'|'down'|'left'|'right'} direction - Direction
     * @param {number} distance - Distance to move
     * @returns {boolean} True if move was successful
     */
    moveVehicle(vehicleId, direction, distance = 1) {
        if (!this.canMoveVehicle(vehicleId, direction, distance)) {
            return false;
        }

        const vehicle = this.vehicles.get(vehicleId);
        vehicle.move(direction, distance);
        this._updateGrid();
        return true;
    }

    /**
     * Check if the player has won
     * @returns {boolean} True if win condition is met
     */
    checkWinCondition() {
        const player = this.getPlayerVehicle();
        if (!player) {
            return false;
        }

        // Player must be horizontal
        if (player.orientation !== 'horizontal') {
            return false;
        }

        // Check if player is on exit row and column
        const cells = player.getOccupiedCells();
        const rightmostCell = cells[cells.length - 1];

        // Player wins when the rightmost cell is at the exit
        return rightmostCell.row === this.exitRow && rightmostCell.col === this.exitCol;
    }

    /**
     * Clone the board
     * @returns {Board} Cloned board
     */
    clone() {
        const newBoard = new Board(this.width, this.height);
        newBoard.exitRow = this.exitRow;
        newBoard.exitCol = this.exitCol;

        for (const vehicle of this.vehicles.values()) {
            newBoard.addVehicle(vehicle.clone());
        }

        return newBoard;
    }

    /**
     * Reset board to initial state
     * @param {Array<Object>} vehicleData - Array of vehicle data
     */
    reset(vehicleData) {
        this.vehicles.clear();
        this.grid = this._createEmptyGrid();

        for (const data of vehicleData) {
            const vehicle = Vehicle.fromJSON(data);
            this.addVehicle(vehicle);
        }
    }

    /**
     * Get all vehicles as array
     * @returns {Array<Vehicle>} Array of vehicles
     */
    getAllVehicles() {
        return Array.from(this.vehicles.values());
    }

    /**
     * Serialize board to JSON
     * @returns {Object} Board data
     */
    toJSON() {
        return {
            width: this.width,
            height: this.height,
            exitRow: this.exitRow,
            exitCol: this.exitCol,
            vehicles: this.getAllVehicles().map(v => v.toJSON())
        };
    }

    /**
     * Create board from JSON data
     * @param {Object} data - Board data
     * @returns {Board} New board instance
     */
    static fromJSON(data) {
        const board = new Board(data.width, data.height);
        board.exitRow = data.exitRow;
        board.exitCol = data.exitCol;

        for (const vehicleData of data.vehicles) {
            const vehicle = Vehicle.fromJSON(vehicleData);
            board.addVehicle(vehicle);
        }

        return board;
    }

    /**
     * Get board state as string (for debugging)
     * @returns {string} Board visualization
     */
    toString() {
        let str = '';
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const vehicleId = this.grid[row][col];
                str += vehicleId ? vehicleId.charAt(0) : '.';
                str += ' ';
            }
            str += '\n';
        }
        return str;
    }
}
