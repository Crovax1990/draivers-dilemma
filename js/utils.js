/**
 * DRAIVER'S DILEMMA - UTILITY FUNCTIONS
 * Helper functions used throughout the application
 */

/**
 * Calculate pixel position from grid coordinates
 * @param {number} gridPos - Grid position (0-5)
 * @returns {number} Pixel position
 */
function gridToPixel(gridPos) {
    const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
    const gridGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-gap'));
    return gridPos * (cellSize + gridGap);
}

/**
 * Calculate grid position from pixel coordinates
 * @param {number} pixelPos - Pixel position
 * @returns {number} Grid position (0-5)
 */
function pixelToGrid(pixelPos) {
    const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
    const gridGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-gap'));
    return Math.round(pixelPos / (cellSize + gridGap));
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get vehicle color by index
 * @param {number} index - Vehicle index
 * @param {boolean} isPlayer - Whether this is the player vehicle
 * @returns {string} CSS color value
 */
function getVehicleColor(index, isPlayer = false) {
    if (isPlayer) {
        return getComputedStyle(document.documentElement).getPropertyValue('--color-player').trim();
    }
    
    const colors = [
        '--color-vehicle-1',
        '--color-vehicle-2',
        '--color-vehicle-3',
        '--color-vehicle-4',
        '--color-vehicle-5',
        '--color-vehicle-6',
        '--color-vehicle-7'
    ];
    
    const colorVar = colors[index % colors.length];
    return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
}

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
        return false;
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Loaded data or default value
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return defaultValue;
    }
}

/**
 * Create particle effect
 * @param {string} emoji - Emoji to use as particle
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function createParticle(emoji, x, y) {
    const container = document.getElementById('particle-container');
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = emoji;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    container.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, 3000);
}

/**
 * Create celebration particles
 * @param {number} count - Number of particles
 */
function celebrateWin(count = 30) {
    const emojis = ['🎉', '⭐', '🚀', '✨', '🎊', '🏆'];
    const container = document.getElementById('particle-container');
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            createParticle(emoji, x, y);
        }, i * 50);
    }
}

/**
 * Calculate performance rating (stars) based on moves
 * @param {number} moves - Actual moves taken
 * @param {number} optimalMoves - Optimal number of moves
 * @returns {number} Star rating (1-3)
 */
function calculateStars(moves, optimalMoves) {
    if (moves === optimalMoves) return 3;
    if (moves <= optimalMoves * 1.5) return 2;
    return 1;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if two positions are equal
 * @param {{row: number, col: number}} pos1 - First position
 * @param {{row: number, col: number}} pos2 - Second position
 * @returns {boolean} True if positions are equal
 */
function positionsEqual(pos1, pos2) {
    return pos1.row === pos2.row && pos1.col === pos2.col;
}
