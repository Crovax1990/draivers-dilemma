# 🚗 Draiver's Dilemma

A modern, browser-based clone of the classic **Rush Hour** sliding block puzzle game. Help Draiver escape the gridlocked parking lot!

![Game Status](https://img.shields.io/badge/status-playable-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎮 How to Play

### Objective
Move the **red car** (Draiver) to the exit on the right side of the board by sliding the blocking vehicles out of the way.

### Rules
- Vehicles can only move in their orientation:
  - **Horizontal** vehicles move left/right
  - **Vertical** vehicles move up/down
- Vehicles cannot overlap
- Must stay within the board boundaries

### Controls

#### 🖱️ Mouse/Touch
- **Drag & Drop**: Click and drag any vehicle to move it

#### ⌨️ Keyboard
- **Arrow Keys**: Move selected vehicle (or red car if none selected)
- **U**: Undo last move
- **R**: Reset level
- **H**: Get a hint

---

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Start playing immediately - no installation required!

### Recommended Browsers
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📁 Project Structure

```
draiver_rush_hour/
├── index.html              # Main game page
├── styles.css              # Premium styling & animations
├── js/
│   ├── main.js            # Game initialization
│   ├── game.js            # Core game controller
│   ├── board.js           # Game board logic
│   ├── vehicle.js         # Vehicle entity class
│   ├── renderer.js        # Visual rendering
│   ├── input-handler.js   # Input management
│   ├── level-manager.js   # Level system
│   └── utils.js           # Helper functions
├── data/
│   └── levels.json        # Level definitions (10 puzzles)
├── assets/
│   ├── sounds/            # Sound effects (optional)
│   └── images/            # Graphics (optional)
└── README.md              # This file
```

---

## 🎯 Features

### Core Gameplay
✅ 10 progressive puzzle levels (Easy → Medium → Hard)  
✅ Smooth drag-and-drop controls  
✅ Keyboard navigation support  
✅ Touch/mobile support  
✅ Undo/redo functionality  
✅ Hint system  
✅ Move counter & timer  

### Visual Design
✅ Modern glassmorphism UI  
✅ Dark gradient theme  
✅ Smooth CSS animations  
✅ Particle effects on win  
✅ Responsive design (desktop/tablet/mobile)  
✅ Premium typography (Google Fonts)  

### User Experience
✅ Progress saving (localStorage)  
✅ Best score tracking  
✅ Star rating system  
✅ Level progression  
✅ Win celebration animations  

---

## 🏆 Game Levels

| Level | Difficulty | Min Moves | Description |
|-------|-----------|-----------|-------------|
| 1-4   | Easy      | 8-14      | Tutorial levels with few obstacles |
| 5-8   | Medium    | 18-25     | More vehicles, trickier patterns |
| 9-10  | Hard      | 30-35     | Complex puzzles requiring planning |

---

## 🛠️ Development

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Patterns**: MVC architecture, Observer, Command
- **Storage**: localStorage for progress persistence

### Code Structure
- **Model**: `Board`, `Vehicle`, `Game` (game state)
- **View**: `Renderer` (visual representation)
- **Controller**: `Game`, `InputHandler` (user interactions)

### Adding New Levels
Edit `data/levels.json` and add a new level object:

```json
{
  "id": 11,
  "difficulty": "hard",
  "minMoves": 40,
  "vehicles": [
    {
      "id": "player",
      "orientation": "horizontal",
      "length": 2,
      "position": { "row": 2, "col": 0 },
      "isPlayer": true
    },
    // ... more vehicles
  ]
}
```

### Customization
- **Colors**: Edit CSS variables in `:root` selector in `styles.css`
- **Board Size**: Modify `Board` class constructor (default 6x6)
- **Cell Size**: Adjust `--cell-size` CSS variable

---

## 🎨 Design Philosophy

### Visual Excellence
- Vibrant, harmonious color palettes
- Smooth micro-animations for engagement
- Glassmorphism effects for modern look
- Dark mode optimized

### Code Quality
- ES6+ modern JavaScript
- JSDoc documentation
- Modular architecture
- Clean separation of concerns

---

## 📱 Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Firefox | ✅      | ✅     |
| Safari  | ✅      | ✅     |
| Edge    | ✅      | ✅     |

**Minimum Requirements**:
- JavaScript ES6+ support
- CSS Grid support
- localStorage API
- HTML5 Dialog element

---

## 🐛 Troubleshooting

### Game Won't Load
- Check browser console for errors (F12)
- Ensure `data/levels.json` exists
- Verify all JavaScript files are present

### Drag Not Working
- Try using keyboard controls instead
- Check if browser blocks drag events
- Ensure no browser extensions interfere

### Progress Not Saving
- Check if browser allows localStorage
- Private/Incognito mode may block storage
- Clear browser cache and reload

---

## 📄 License

MIT License - feel free to use, modify, and distribute!

---

## 🙏 Credits

**Game Design**: Based on the classic Rush Hour puzzle game  
**Development**: Built with ❤️ for Draiver & Crovax  
**Fonts**: [Google Fonts](https://fonts.google.com) (Inter, Outfit)

---

## 🎉 Have Fun!

Enjoy escaping the rush hour traffic! Can you complete all levels with optimal moves? 🚗💨

---

**Version**: 1.0.0  
**Last Updated**: January 2026
