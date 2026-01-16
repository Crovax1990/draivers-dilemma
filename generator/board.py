
class Vehicle:
    def __init__(self, id, orientation, length, row, col):
        self.id = id
        self.orientation = orientation  # 'horizontal' or 'vertical'
        self.length = length
        self.row = row
        self.col = col

    def occupies(self):
        """Returns a set of (row, col) tuples occupied by this vehicle."""
        cells = set()
        for i in range(self.length):
            if self.orientation == 'horizontal':
                cells.add((self.row, self.col + i))
            else:
                cells.add((self.row + i, self.col))
        return cells

    def copy(self):
        return Vehicle(self.id, self.orientation, self.length, self.row, self.col)

    def __repr__(self):
        return f"{self.id}({self.orientation}, {self.length}) @ ({self.row}, {self.col})"

class Board:
    def __init__(self, size=6):
        self.size = size
        self.vehicles = {}  # id -> Vehicle
        # Grid is implicitly defined by vehicle positions to save memory/complexity in hashing

    def add_vehicle(self, vehicle):
        # Check for overlap
        new_cells = vehicle.occupies()
        for v in self.vehicles.values():
            if not new_cells.isdisjoint(v.occupies()):
                return False # Overlap detected
        
        # Check bounds
        for r, c in new_cells:
            if r < 0 or r >= self.size or c < 0 or c >= self.size:
                return False # Out of bounds

        self.vehicles[vehicle.id] = vehicle
        return True

    def get_state_hash(self):
        """Returns a hashable representation of the board state."""
        # Tuple of sorted vehicle states: (id, row, col)
        # Orientation and length don't change, so we don't need them in the state hash for solving
        state = []
        for v_id in sorted(self.vehicles.keys()):
            v = self.vehicles[v_id]
            state.append((v_id, v.row, v.col))
        return tuple(state)

    def is_solved(self):
        # Assuming Red Car is always 'car-red' or similar convention
        # We'll expect the generator to name the target car 'target' or 'red'
        # Let's standardize on 'target' for the generator logic
        if 'target' not in self.vehicles:
            return False
            
        target = self.vehicles['target']
        # Target must be horizontal and reach the right edge
        # Valid exit is usually (2, 5) for 6x6. 
        # So if target.col + target.length == self.size, it's at the exit.
        return target.col + target.length == self.size

    def get_occupied_cells(self):
        occupied = set()
        for v in self.vehicles.values():
            occupied.update(v.occupies())
        return occupied

    def get_possible_moves(self):
        moves = [] # List of (vehicle_id, steps)
        occupied = self.get_occupied_cells()
        
        for v_id, vehicle in self.vehicles.items():
            # Try moving forward (positive steps)
            current_my_cells = vehicle.occupies()
            
            # Check range of movement
            # Forward
            for steps in range(1, self.size):
                blocked = False
                check_cells = set()
                
                for i in range(vehicle.length):
                    if vehicle.orientation == 'horizontal':
                        r, c = vehicle.row, vehicle.col + vehicle.length - 1 + steps # Front edge + steps
                    else:
                        r, c = vehicle.row + vehicle.length - 1 + steps, vehicle.col # Front edge + steps
                    
                    if r >= self.size or c >= self.size:
                        blocked = True
                        break
                    
                    if (r,c) in occupied and (r,c) not in current_my_cells:
                         blocked = True
                         break
                
                if blocked:
                    break
                moves.append((v_id, steps))

            # Backward
            for steps in range(1, self.size):
                blocked = False
                
                for i in range(vehicle.length):
                    if vehicle.orientation == 'horizontal':
                        r, c = vehicle.row, vehicle.col - steps 
                    else:
                        r, c = vehicle.row - steps, vehicle.col
                    
                    if r < 0 or c < 0:
                        blocked = True
                        break
                    
                    if (r,c) in occupied and (r,c) not in current_my_cells:
                        blocked = True
                        break
                        
                if blocked:
                    break
                moves.append((v_id, -steps))
                
        return moves

    def move(self, v_id, steps):
        """Returns a NEW Board instance with the move applied."""
        new_board = Board(self.size)
        # Deep copy vehicles
        for vid, v in self.vehicles.items():
            new_v = v.copy()
            if vid == v_id:
                if new_v.orientation == 'horizontal':
                    new_v.col += steps
                else:
                    new_v.row += steps
            new_board.add_vehicle(new_v)
        return new_board
    
    def __str__(self):
        grid = [['.' for _ in range(self.size)] for _ in range(self.size)]
        for v in self.vehicles.values():
            char = v.id[0].upper()
            if v.id == 'target': char = 'R'
            for r, c in v.occupies():
                grid[r][c] = char
        return '\n'.join([' '.join(row) for row in grid])
