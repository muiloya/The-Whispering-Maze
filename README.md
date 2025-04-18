# The Whispering Maze

## Project Description

The **Whispering Maze** is a puzzle game where the player navigates through a mysterious labyrinth to find the exit. The game features an oracle that wanders around the maze mysteriously, waiting for the player to find it. The oracle provides hints once the player is close, guiding them toward the goal. With a limited view of the maze, the player must rely on their sense of direction and the oracle’s hints to escape. The game combines exploration, problem‑solving, and strategy, with a spooky theme that adds an element of suspense and mystery.

## How to Run

1. **Install dependecies**  
   ```bash
   npm install three.js
   npm install vite
2. **Play the game**
    ```bash
    npx vite
In a browser, go to the given address to play the game.\
**Note**: For the installing, make sure you are in the same directory as your files or execute these commands in the root directory.

## Controls
- W, A, S, D or Arrow Keys to Move the player
- To start or restart the game press any button when promted

## Topics Implemented
- **Collision Avoidance** \
The oracle uses a three‑whisker raycasting (Reynold's Algorithm) method to detect and steer around walls.\
**How to view**: You would notice while the orcale is moving it always attemptes to steer away from the walls.
- **State Machine**\
The oracle switches between *Wander* and *Hinting* states based on player proximity from the oracle. \
**How to view**: When you notice the orcale from a distance it's just wandering around, once you get close enough it pauses, issues a hint, and then goes away showing the state transition.
- **Flow Field Pathfinding**  
A vector field is used to implement hint logic via Dijkstra’s cost map. \
**How to view**: Using the flow field it generates hints, which outlines a path to goal for the player ot follow.
- **Depth‑First Backtracking Maze Generation** \
The maze is generated at runtime using a DFS backtracking algorithm.\
**How to view**: Each new game starts with a new, solvable maze layout.
- **Wander**\
The oracle moves randomly through the maze, avoiding walls until you approach. \
**How to view**: While observing the oracle it is moving in an unpredictable manner.