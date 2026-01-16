
from collections import deque
from .board import Board

def solve_board(board):
    """
    Solves the given board state using BFS.
    Returns: (is_solvable, min_moves, solution_path)
    """
    start_hash = board.get_state_hash()
    queue = deque([(board, 0, [])]) # (current_board_obj, moves_count, path_list)
    visited = {start_hash}

    MAX_DEPTH = 100 # Safety break for very complex puzzles or loops
    
    # Check if started solved
    if board.is_solved():
        return (True, 0, [])

    while queue:
        current_board, moves, path = queue.popleft()
        
        if moves >= MAX_DEPTH:
            continue

        possible_moves = current_board.get_possible_moves()
        
        for v_id, steps in possible_moves:
            next_board = current_board.move(v_id, steps)
            next_hash = next_board.get_state_hash()
            
            if next_hash not in visited:
                new_path = path + [(v_id, steps)]
                if next_board.is_solved():
                    return (True, moves + 1, new_path)
                
                visited.add(next_hash)
                queue.append((next_board, moves + 1, new_path))
                
    return (False, 0, [])

def get_moves_count(board):
    """Simple wrapper to just get the complexity."""
    solved, moves, _ = solve_board(board)
    return moves if solved else -1
