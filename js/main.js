/**
 * DRAIVER'S DILEMMA - MAIN ENTRY POINT
 * Initializes and starts the game
 */

// Global game instance
let game = null;

/**
 * Initialize game when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚗 Draiver\'s Dilemma - Loading...');

    try {
        // Create game instance
        game = new Game();

        // Initialize
        await game.initialize();

        console.log('🎮 Game ready! Use drag & drop or arrow keys to play.');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to load the game. Please refresh the page.');
    }
});

/**
 * Handle window resize
 */
window.addEventListener('resize', debounce(() => {
    if (game && game.renderer) {
        game.renderer.renderBoard(game.board);
    }
}, 250));

/**
 * Prevent accidental page navigation
 */
window.addEventListener('beforeunload', (event) => {
    if (game && game.moveCount > 0 && game.gameState === 'playing') {
        event.preventDefault();
        event.returnValue = '';
    }
});
