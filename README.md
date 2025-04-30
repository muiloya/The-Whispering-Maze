# The Whispering Maze

## Project Description

The **Whispering Maze** is a puzzle game where the player navigates through a mysterious labyrinth to find the exit. The game features an oracle that wanders around the maze mysteriously, waiting for the player to find it. The oracle provides hints once the player is close, or it guides them itself toward the goal (depending on their luck!). With a limited view of the maze, the player must rely on their sense of direction and the oracle’s hints to escape. The game combines exploration, problem‑solving, and strategy, with a spooky theme that adds an element of suspense and mystery.

## How to Run

1. **Install dependencies**  
   Make sure you're in the root directory of the project, then run:  
   ```bash
   npm install three
   npm install vite
   ```

2. **Start the game**  
   Launch the development server with:  
   ```bash
   npx vite
   ```

   Open your browser and navigate to the address provided in the terminal.

**Note:** Ensure you are in the correct project directory before running these commands.

## Controls
- W, A, S, D or Arrow Keys to Move the player
- To start or restart the game press any key when prompted

## Algorithms Implemented
- **Collision Avoidance** \
The oracle uses a three‑whisker raycasting (Reynold's Algorithm) method to detect and steer away from walls.\
**How to view**: You would notice while the orcale is moving it always attempts to steer away from the walls.
- **State Machine**\
The oracle switches between *Wander*, *Hinting*, and *Solving* states based on player proximity from the oracle. \
**How to view**: When you observe the oracle from a distance it's just wandering around, once the player get close enough it either issues a hint, or it guides the player for a short distance and then disappears showing the state transition.
- **Flow Field Pathfinding**  
A vector field is generated using Djkstra’s algorithm which the oracle uses to implement hint logic. \
**How to view**: In the hinting state the oracle uses the flow field to generate hints for next steps and in the solving state the oracle uses it to outline a path to the goal for the player to follow.
- **Depth‑First Backtracking Maze Generation** \
The maze is generated at runtime using a DFS backtracking algorithm.\
**How to view**: Each new game starts with a new, solvable maze layout.
- **Wander**\
The oracle moves randomly through the maze, avoiding walls until the player approaches close. \
**How to view**: While observing the oracle it is moving in a natural yet unpredictable manner.
