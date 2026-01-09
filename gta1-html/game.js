// GTA 1 Style Driving MVP
// A simple top-down car driving game

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Input state
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
};

// Car properties
const car = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    rotation: -Math.PI / 2,  // Start facing up
    speed: 0,
    
    // Physics tuning
    maxSpeed: 6,
    acceleration: 0.12,
    braking: 0.18,
    friction: 0.02,
    turnSpeed: 0.05,
    handbrakeMultiplier: 0.96,
    
    // Dimensions
    width: 40,
    height: 20
};

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.down = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Space':
            keys.space = true;
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.down = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'Space':
            keys.space = false;
            break;
    }
});

// Mobile touch controls
function setupMobileControls() {
    const buttons = document.querySelectorAll('.dpad-btn, .handbrake-btn');
    
    buttons.forEach(button => {
        const key = button.dataset.key;
        
        // Touch start - activate control
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.classList.add('active');
            if (key === 'space') {
                keys.space = true;
            } else {
                keys[key] = true;
            }
        }, { passive: false });
        
        // Touch end - deactivate control
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (key === 'space') {
                keys.space = false;
            } else {
                keys[key] = false;
            }
        }, { passive: false });
        
        // Touch cancel - deactivate control
        button.addEventListener('touchcancel', (e) => {
            button.classList.remove('active');
            if (key === 'space') {
                keys.space = false;
            } else {
                keys[key] = false;
            }
        });
        
        // Mouse events for testing on desktop
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            button.classList.add('active');
            if (key === 'space') {
                keys.space = true;
            } else {
                keys[key] = true;
            }
        });
        
        button.addEventListener('mouseup', (e) => {
            button.classList.remove('active');
            if (key === 'space') {
                keys.space = false;
            } else {
                keys[key] = false;
            }
        });
        
        button.addEventListener('mouseleave', (e) => {
            button.classList.remove('active');
            if (key === 'space') {
                keys.space = false;
            } else {
                keys[key] = false;
            }
        });
    });
}

// Initialize mobile controls when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileControls);
} else {
    setupMobileControls();
}

// Update car physics
function updateCar() {
    // Calculate turn factor based on speed (slower = tighter turns)
    const speedRatio = Math.abs(car.speed) / car.maxSpeed;
    const turnFactor = speedRatio * 0.8 + 0.2;  // Min 20% turn ability
    
    // Steering - only effective when moving
    if (car.speed !== 0) {
        const turnDirection = car.speed > 0 ? 1 : -1;
        if (keys.left) {
            car.rotation -= car.turnSpeed * turnFactor * turnDirection;
        }
        if (keys.right) {
            car.rotation += car.turnSpeed * turnFactor * turnDirection;
        }
    }
    
    // Acceleration and braking
    if (keys.up) {
        car.speed += car.acceleration;
    } else if (keys.down) {
        if (car.speed > 0) {
            // Braking when moving forward
            car.speed -= car.braking;
        } else {
            // Reversing
            car.speed -= car.acceleration * 0.6;
        }
    } else {
        // Apply friction when no input
        if (Math.abs(car.speed) > car.friction) {
            car.speed -= Math.sign(car.speed) * car.friction;
        } else {
            car.speed = 0;
        }
    }
    
    // Handbrake - allows sliding/drifting
    if (keys.space && Math.abs(car.speed) > 0.5) {
        car.speed *= car.handbrakeMultiplier;
        // Add extra turning when handbraking
        if (keys.left) {
            car.rotation -= car.turnSpeed * 1.5;
        }
        if (keys.right) {
            car.rotation += car.turnSpeed * 1.5;
        }
    }
    
    // Clamp speed
    car.speed = Math.max(-car.maxSpeed * 0.4, Math.min(car.speed, car.maxSpeed));
    
    // Update position based on rotation
    car.x += Math.cos(car.rotation) * car.speed;
    car.y += Math.sin(car.rotation) * car.speed;
    
    // Wrap around screen edges
    if (car.x < -car.width) car.x = canvas.width + car.width;
    if (car.x > canvas.width + car.width) car.x = -car.width;
    if (car.y < -car.height) car.y = canvas.height + car.height;
    if (car.y > canvas.height + car.height) car.y = -car.height;
}

// Render the game
function render() {
    // Clear canvas with road color
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road markings (simple dashed lines)
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    
    // Horizontal lines
    for (let y = 100; y < canvas.height; y += 150) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 100; x < canvas.width; x += 150) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Draw car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.rotation);
    
    // Car shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-car.width/2 + 3, -car.height/2 + 3, car.width, car.height);
    
    // Car body (blue)
    ctx.fillStyle = '#2266dd';
    ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);
    
    // Car roof (darker blue)
    ctx.fillStyle = '#1a4fa8';
    ctx.fillRect(-car.width/4, -car.height/3, car.width/2, car.height/1.5);
    
    // Front lights (yellow)
    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(car.width/2 - 4, -car.height/2 + 2, 4, 4);
    ctx.fillRect(car.width/2 - 4, car.height/2 - 6, 4, 4);
    
    // Rear lights (red)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(-car.width/2, -car.height/2 + 2, 3, 4);
    ctx.fillRect(-car.width/2, car.height/2 - 6, 3, 4);
    
    ctx.restore();
    
    // Draw UI
    drawUI();
}

// Draw user interface
function drawUI() {
    // Speed display
    const speedMPH = Math.abs(Math.round(car.speed * 15));
    const direction = car.speed < 0 ? ' (R)' : '';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 140, 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SPEED', 20, 32);
    
    ctx.fillStyle = car.speed < 0 ? '#ff6666' : '#66ff66';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(speedMPH + ' mph' + direction, 20, 54);
    
    // Handbrake indicator
    if (keys.space) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillRect(160, 10, 100, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('HANDBRAKE', 168, 30);
    }
}

// Main game loop
function gameLoop() {
    updateCar();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
console.log('GTA 1 Style Driving MVP - Starting...');
gameLoop();
