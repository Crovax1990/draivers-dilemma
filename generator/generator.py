
import random
import json
import argparse
import sys
import os

# Allow running from inside the directory or root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generator.board import Board, Vehicle
from generator.solver import solve_board

def generate_random_level(difficulty_min_moves=10, max_attempts=1000):
    """
    Tries to generate a solvable level with at least `difficulty_min_moves`.
    """
    for _ in range(max_attempts):
        board = Board()
        
        # 1. Place Target Car (Red)
        # Row 2, any valid column 0-3 (since length is 2 and exit is at 5)
        # Actually, for harder levels, we usually want it further back (col 0 or 1)
        target_col = random.randint(0, 3)
        target_car = Vehicle('target', 'horizontal', 2, 2, target_col)
        board.add_vehicle(target_car)
        
        # 2. Add random obstacles
        # Classic Rush hour has ~12-14 vehicles.
        num_vehicles = random.randint(8, 13) 
        
        for i in range(num_vehicles):
            # 70% car (len 2), 30% truck (len 3)
            length = 2 if random.random() < 0.7 else 3
            orientation = 'horizontal' if random.random() < 0.5 else 'vertical'
            
            # Try to place it
            placed = False
            for _ in range(20): # Try 20 times to find a spot for this vehicle
                row = random.randint(0, 5)
                col = random.randint(0, 5)
                
                # Heuristic: Don't block the exit immediately with a horizontal car on row 2
                if row == 2 and orientation == 'horizontal':
                    continue
                    
                v_id = f"{'car' if length==2 else 'truck'}_{i}"
                new_v = Vehicle(v_id, orientation, length, row, col)
                
                if board.add_vehicle(new_v):
                    placed = True
                    break
        
        # 3. Solve Check
        is_solvable, moves, path = solve_board(board)
        
        if is_solvable and moves >= difficulty_min_moves:
            return {
                "difficulty_score": moves,
                "vehicles": board.vehicles
            }
            
    return None

def convert_to_game_format(generated_level, level_id):
    """Converts internal board representation to game's JSON format."""
    vehicles = []
    
    # Process target car first for consistency
    target = generated_level['vehicles']['target']
    vehicles.append({
        "id": "target",
        "orientation": "horizontal",
        "length": 2,
        "position": { "row": target.row, "col": target.col },
        "is_target": True # Explicitly mark valid red car
    })
    
    count = 1
    for v_id, v in generated_level['vehicles'].items():
        if v_id == 'target': continue
        
        # Map internal IDs to game IDs (car1, car2... truck1...)
        # Game seems to use generic IDs, but let's strictly follow 'car' or 'truck' prefix
        # Update: The game logic likely depends on specific IDs for coloring or we can just assign new ones.
        # Let's map simpler IDs.
        
        prefix = "car" if v.length == 2 else "truck"
        final_id = f"{prefix}{count}"
        count += 1
        
        vehicles.append({
            "id": final_id,
            "orientation": v.orientation,
            "length": v.length,
            "position": { "row": v.row, "col": v.col }
        })
        
    return {
        "id": level_id,
        "difficulty": "Generated",
        "minMoves": generated_level['difficulty_score'],
        "vehicles": vehicles
    }

def main():
    parser = argparse.ArgumentParser(description="Generate Rush Hour levels.")
    parser.add_argument("--count", type=int, default=5, help="Number of levels to generate")
    parser.add_argument("--difficulty", type=int, default=15, help="Minimum moves required")
    parser.add_argument("--output", default="new_levels.json", help="Output file")
    
    args = parser.parse_args()
    
    output_data = {"levels": []}
    
    print(f"Generating {args.count} levels with minimum {args.difficulty} moves...")
    
    for i in range(args.count):
        print(f"  > Generating Level {i+1}...")
        level = generate_random_level(difficulty_min_moves=args.difficulty)
        
        if level:
            print(f"    [SUCCESS] Solvable in {level['difficulty_score']} moves!")
            game_level = convert_to_game_format(level, i + 1)
            output_data["levels"].append(game_level)
        else:
            print("    [FAILED] Could not generate valid level in attempts limit.")

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"\nSaved {len(output_data['levels'])} levels to {args.output}")

if __name__ == "__main__":
    main()
