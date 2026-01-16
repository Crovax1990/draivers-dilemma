/**
 * DRAIVER'S DILEMMA - LEVEL MANAGER
 * Handles level loading and progression
 */

class LevelManager {
    /**
     * Create level manager
     */
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.levelProgress = {}; // levelId -> {completed, bestMoves, bestTime}
        this.loaded = false;
    }

    /**
     * Load levels from JSON file
     * @returns {Promise<boolean>} True if successfully loaded
     */
    async loadLevels() {
        try {
            const response = await fetch('data/levels.json');
            const data = await response.json();
            this.levels = data.levels;
            this.loaded = true;

            // Load progress from localStorage
            this._loadProgress();

            console.log(`Loaded ${this.levels.length} levels`);
            return true;
        } catch (error) {
            console.error('Failed to load levels:', error);

            // Use default levels if file doesn't exist
            this._loadDefaultLevels();
            return true;
        }
    }

    /**
     * Load default levels (fallback)
     * @private
     */
    _loadDefaultLevels() {
        this.levels = [
            {
                id: 1,
                difficulty: "easy",
                minMoves: 8,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 0 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 2 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 3, col: 3 } }
                ]
            },
            {
                id: 2,
                difficulty: "easy",
                minMoves: 10,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 0 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 2 } },
                    { id: "car1", orientation: "vertical", length: 2, position: { row: 1, col: 3 } },
                    { id: "car2", orientation: "horizontal", length: 2, position: { row: 4, col: 1 } }
                ]
            },
            {
                id: 3,
                difficulty: "easy",
                minMoves: 12,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 1 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 3 } },
                    { id: "truck2", orientation: "vertical", length: 3, position: { row: 3, col: 0 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 0, col: 0 } },
                    { id: "car2", orientation: "vertical", length: 2, position: { row: 4, col: 4 } }
                ]
            },
            {
                id: 4,
                difficulty: "easy",
                minMoves: 14,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 0 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 1, col: 2 } },
                    { id: "truck2", orientation: "horizontal", length: 3, position: { row: 4, col: 2 } },
                    { id: "car1", orientation: "vertical", length: 2, position: { row: 0, col: 4 } },
                    { id: "car2", orientation: "horizontal", length: 2, position: { row: 5, col: 0 } }
                ]
            },
            {
                id: 5,
                difficulty: "medium",
                minMoves: 18,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 1 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 0 } },
                    { id: "truck2", orientation: "vertical", length: 3, position: { row: 2, col: 3 } },
                    { id: "truck3", orientation: "horizontal", length: 3, position: { row: 5, col: 1 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 0, col: 3 } },
                    { id: "car2", orientation: "vertical", length: 2, position: { row: 3, col: 5 } }
                ]
            },
            {
                id: 6,
                difficulty: "medium",
                minMoves: 20,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 0 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 2 } },
                    { id: "truck2", orientation: "vertical", length: 3, position: { row: 3, col: 4 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 1, col: 3 } },
                    { id: "car2", orientation: "vertical", length: 2, position: { row: 0, col: 4 } },
                    { id: "car3", orientation: "horizontal", length: 2, position: { row: 4, col: 0 } },
                    { id: "car4", orientation: "vertical", length: 2, position: { row: 4, col: 2 } }
                ]
            },
            {
                id: 7,
                difficulty: "medium",
                minMoves: 22,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 1 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 0 } },
                    { id: "truck2", orientation: "horizontal", length: 3, position: { row: 0, col: 3 } },
                    { id: "truck3", orientation: "vertical", length: 3, position: { row: 1, col: 3 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 3, col: 0 } },
                    { id: "car2", orientation: "vertical", length: 2, position: { row: 4, col: 1 } },
                    { id: "car3", orientation: "horizontal", length: 2, position: { row: 5, col: 4 } }
                ]
            },
            {
                id: 8,
                difficulty: "medium",
                minMoves: 25,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 0 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 2 } },
                    { id: "truck2", orientation: "vertical", length: 3, position: { row: 2, col: 4 } },
                    { id: "truck3", orientation: "horizontal", length: 3, position: { row: 5, col: 0 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 0, col: 4 } },
                    { id: "car2", orientation: "vertical", length: 2, position: { row: 1, col: 1 } },
                    { id: "car3", orientation: "horizontal", length: 2, position: { row: 3, col: 2 } },
                    { id: "car4", orientation: "vertical", length: 2, position: { row: 3, col: 5 } }
                ]
            },
            {
                id: 9,
                difficulty: "hard",
                minMoves: 30,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 0 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 2 } },
                    { id: "truck2", orientation: "vertical", length: 3, position: { row: 3, col: 3 } },
                    { id: "truck3", orientation: "horizontal", length: 3, position: { row: 0, col: 3 } },
                    { id: "car1", orientation: "vertical", length: 2, position: { row: 1, col: 1 } },
                    { id: "car2", orientation: "horizontal", length: 2, position: { row: 3, col: 0 } },
                    { id: "car3", orientation: "vertical", length: 2, position: { row: 4, col: 1 } },
                    { id: "car4", orientation: "horizontal", length: 2, position: { row: 5, col: 4 } }
                ]
            },
            {
                id: 10,
                difficulty: "hard",
                minMoves: 35,
                vehicles: [
                    { id: "player", orientation: "horizontal", length: 2, position: { row: 2, col: 1 }, isPlayer: true },
                    { id: "truck1", orientation: "vertical", length: 3, position: { row: 0, col: 0 } },
                    { id: "truck2", orientation: "vertical", length: 3, position: { row: 1, col: 3 } },
                    { id: "truck3", orientation: "horizontal", length: 3, position: { row: 4, col: 1 } },
                    { id: "truck4", orientation: "vertical", length: 3, position: { row: 3, col: 5 } },
                    { id: "car1", orientation: "horizontal", length: 2, position: { row: 0, col: 4 } },
                    { id: "car2", orientation: "vertical", length: 2, position: { row: 0, col: 1 } },
                    { id: "car3", orientation: "horizontal", length: 2, position: { row: 3, col: 0 } },
                    { id: "car4", orientation: "vertical", length: 2, position: { row: 4, col: 4 } }
                ]
            }
        ];
        this.loaded = true;
        this._loadProgress();
        console.log(`Loaded ${this.levels.length} default levels (JSON fetch failed)`);
    }

    /**
     * Load progress from localStorage
     * @private
     */
    _loadProgress() {
        this.levelProgress = loadFromStorage('draiver_progress', {});
        this.currentLevelIndex = loadFromStorage('draiver_current_level', 0);
    }

    /**
     * Save progress to localStorage
     * @private
     */
    _saveProgress() {
        saveToStorage('draiver_progress', this.levelProgress);
        saveToStorage('draiver_current_level', this.currentLevelIndex);
    }

    /**
     * Get current level
     * @returns {Object|null} Level data
     */
    getCurrentLevel() {
        if (!this.loaded || this.currentLevelIndex >= this.levels.length) {
            return null;
        }
        return this.levels[this.currentLevelIndex];
    }

    /**
     * Get level by index
     * @param {number} index - Level index
     * @returns {Object|null} Level data
     */
    getLevel(index) {
        if (index < 0 || index >= this.levels.length) {
            return null;
        }
        return this.levels[index];
    }

    /**
     * Go to next level
     * @returns {Object|null} Next level data or null if at end
     */
    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this._saveProgress();
            return this.getCurrentLevel();
        }
        return null;
    }

    /**
     * Go to previous level
     * @returns {Object|null} Previous level data or null if at start
     */
    previousLevel() {
        if (this.currentLevelIndex > 0) {
            this.currentLevelIndex--;
            this._saveProgress();
            return this.getCurrentLevel();
        }
        return null;
    }

    /**
     * Set current level by index
     * @param {number} index - Level index
     * @returns {boolean} True if successful
     */
    setLevel(index) {
        if (index < 0 || index >= this.levels.length) {
            return false;
        }
        this.currentLevelIndex = index;
        this._saveProgress();
        return true;
    }

    /**
     * Mark level as completed
     * @param {number} levelId - Level ID
     * @param {number} moves - Number of moves taken
     * @param {number} time - Time in seconds
     */
    completeLevel(levelId, moves, time) {
        if (!this.levelProgress[levelId]) {
            this.levelProgress[levelId] = {
                completed: true,
                bestMoves: moves,
                bestTime: time
            };
        } else {
            this.levelProgress[levelId].completed = true;
            if (moves < this.levelProgress[levelId].bestMoves) {
                this.levelProgress[levelId].bestMoves = moves;
            }
            if (time < this.levelProgress[levelId].bestTime) {
                this.levelProgress[levelId].bestTime = time;
            }
        }

        this._saveProgress();
    }

    /**
     * Get level progress
     * @param {number} levelId - Level ID
     * @returns {Object|null} Progress data
     */
    getLevelProgress(levelId) {
        return this.levelProgress[levelId] || null;
    }

    /**
     * Check if level is completed
     * @param {number} levelId - Level ID
     * @returns {boolean} True if completed
     */
    isLevelCompleted(levelId) {
        return this.levelProgress[levelId]?.completed || false;
    }

    /**
     * Get total level count
     * @returns {number} Total levels
     */
    getTotalLevels() {
        return this.levels.length;
    }

    /**
     * Get current level index (0-based)
     * @returns {number} Current level index
     */
    getCurrentLevelIndex() {
        return this.currentLevelIndex;
    }

    /**
     * Reset all progress
     */
    resetAllProgress() {
        this.levelProgress = {};
        this.currentLevelIndex = 0;
        this._saveProgress();
    }
}
