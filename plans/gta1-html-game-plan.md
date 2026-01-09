# GTA 1 Style HTML Game - Minimal MVP Plan

## Goal: Drivable Car on Empty Road

The absolute simplest starting point - a car you can drive around on a flat surface with good-feeling arcade physics. No city, no collisions, no camera - just pure driving feel.

---

## What We're Building

- A single car (colored rectangle)
- Empty gray "road" background
- Arcade-style driving physics
- WASD/Arrow controls
- Handbrake for drifting
- Speed display

**That's it.** Once this feels fun, we expand.

---

## File Structure (Minimal)

```
gta1-html/
├── index.html      # Canvas and game container
├── styles.css      # Basic styling
└── game.js         # ALL game code in one file
```

**3 files total.** We can split into modules later.

---

## Controls

| Key | Action |
|-----|--------|
| W / Up | Accelerate |
| S / Down | Brake / Reverse |
| A / Left | Steer left |
| D / Right | Steer right |
| Space | Handbrake |

---

## Vehicle Physics Design

```javascript
// Core physics values to tune
const car = {
    x: 400,              // Center of canvas
    y: 300,
    rotation: 0,         // Radians, 0 = facing right
    speed: 0,            // Current speed
    
    // Tunables
    maxSpeed: 5,
    acceleration: 0.1,
    braking: 0.15,
    friction: 0.02,      // Passive slowdown
    turnSpeed: 0.04,     // How fast car rotates
    
    // Dimensions
    width: 40,
    height: 20
};
```

### Physics Logic

```javascript
function updateCar() {
    // Steering - only works when moving
    if (keys.left) car.rotation -= car.turnSpeed * Math.abs(car.speed) / car.maxSpeed;
    if (keys.right) car.rotation += car.turnSpeed * Math.abs(car.speed) / car.maxSpeed;
    
    // Acceleration
    if (keys.up) {
        car.speed += car.acceleration;
    } else if (keys.down) {
        car.speed -= car.braking;
    } else {
        // Apply friction when no input
        if (car.speed > 0) car.speed -= car.friction;
        if (car.speed < 0) car.speed += car.friction;
        if (Math.abs(car.speed) < car.friction) car.speed = 0;
    }
    
    // Handbrake - reduces grip, allows drift
    if (keys.space) {
        car.speed *= 0.98;  // Slight slowdown
        // Could add drift angle here later
    }
    
    // Clamp speed
    car.speed = Math.max(-car.maxSpeed * 0.4, Math.min(car.speed, car.maxSpeed));
    
    // Move based on rotation
    car.x += Math.cos(car.rotation) * car.speed;
    car.y += Math.sin(car.rotation) * car.speed;
    
    // Wrap around edges (for now)
    if (car.x < 0) car.x = canvas.width;
    if (car.x > canvas.width) car.x = 0;
    if (car.y < 0) car.y = canvas.height;
    if (car.y > canvas.height) car.y = 0;
}
```

---

## Rendering

```javascript
function render() {
    // Clear canvas - gray road
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw car (rotated rectangle)
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.rotation);
    
    // Car body - blue
    ctx.fillStyle = '#3366ff';
    ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);
    
    // Front indicator - yellow
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(car.width/2 - 5, -car.height/2, 5, car.height);
    
    ctx.restore();
    
    // Speed display
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText('Speed: ' + Math.round(car.speed * 20) + ' mph', 10, 25);
}
```

---

## Game Loop

```javascript
function gameLoop() {
    updateCar();
    render();
    requestAnimationFrame(gameLoop);
}

// Start
gameLoop();
```

---

## Implementation Steps

### Step 1: HTML Setup
- [ ] Create index.html with 800x600 canvas
- [ ] Add styles.css for centering canvas
- [ ] Add script tag for game.js

### Step 2: Basic Loop
- [ ] Get canvas context
- [ ] Create game loop with requestAnimationFrame
- [ ] Clear canvas each frame

### Step 3: Input Handling
- [ ] Track keydown/keyup for WASD and arrows
- [ ] Store key states in object
- [ ] Add space bar for handbrake

### Step 4: Car Object
- [ ] Define car properties
- [ ] Implement updateCar function
- [ ] Add acceleration and braking
- [ ] Add steering based on speed

### Step 5: Rendering
- [ ] Draw gray background
- [ ] Draw rotated car rectangle
- [ ] Add front indicator
- [ ] Display speed

### Step 6: Tuning
- [ ] Test and adjust maxSpeed
- [ ] Tune acceleration feel
- [ ] Adjust turn responsiveness
- [ ] Make handbrake feel fun

---

## Visual Preview

```
+--------------------------------------------------+
|                                                  |
|                   GRAY ROAD                      |
|                                                  |
|                    +====+                        |
|                    | >  |  <-- Blue car with     |
|                    +====+      yellow front      |
|                                                  |
|  Speed: 45 mph                                   |
|                                                  |
+--------------------------------------------------+
```

---

## Physics Tuning Guide

| Feel | Adjust |
|------|--------|
| Too slow | Increase maxSpeed, acceleration |
| Too fast | Decrease maxSpeed |
| Turns too sharp | Decrease turnSpeed |
| Turns too wide | Increase turnSpeed |
| Too slippery | Increase friction |
| Stops too fast | Decrease friction |
| Handbrake weak | Reduce speed multiplier |

---

## Expansion Path

Once the car feels good to drive:

```
Step 1: Drivable car        <-- YOU ARE HERE
   ↓
Step 2: Add world bounds (walls)
   ↓
Step 3: Add tile-based city
   ↓
Step 4: Add camera following
   ↓
Step 5: Add other vehicles
   ↓
Step 6: Add walking mode
   ↓
Step 7: Add police chase
```

---

## Success Criteria

The MVP is complete when:

1. Car moves forward when pressing W/Up
2. Car reverses with S/Down
3. Car steers with A/D or Left/Right
4. Steering is speed-dependent (slower = tighter turns)
5. Car slows down naturally when no input
6. Handbrake lets you slide/drift
7. Speed is displayed on screen
8. **It feels fun to drive around!**

---

## Ready to Code?

This entire MVP can be built in a single game.js file under 150 lines. Once you approve, we can switch to Code mode and implement it.
