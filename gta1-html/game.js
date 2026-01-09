// GTA 1 Style Driving - First Person View
// Pseudo-3D racing game using 2D canvas
// VERSION 2.0 - Fixed acceleration and steering

const VERSION = '2.0';

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

// Road parameters
const road = {
    width: 2000,          // Road width in world units
    segmentLength: 200,   // Length of each road segment
    rumbleLength: 3,      // Number of segments per rumble strip
    lanes: 3,             // Number of lanes
    drawDistance: 300,    // How many segments to draw (increased)
    fogDensity: 0,        // No fog for clearer view
    cameraHeight: 1000,   // Camera height above road
    cameraDepth: 0.84     // Camera depth (field of view)
};

// Player car
const player = {
    x: 0,                 // Player x offset from center (-1 to 1)
    z: 0,                 // Player position along the road
    speed: 0,             // Current speed
    maxSpeed: 800,        // Very fast max speed
    accel: 400,           // Super fast acceleration
    braking: 500,         // Super fast braking
    decel: 50,            // Natural deceleration
    offRoadDecel: 100,
    offRoadLimit: 0.3,
    turnSpeed: 8          // Very fast turning
};

// Road segments
const segments = [];
const colors = {
    sky: '#72d7ee',
    tree: '#005108',
    fog: '#aaccdd',
    road: { dark: '#696969', light: '#6b6b6b' },
    grass: { dark: '#10aa10', light: '#009a00' },
    rumble: { dark: '#555555', light: '#bbbbbb' },
    lane: '#cccccc'
};

// Build the road
function buildRoad() {
    segments.length = 0;
    
    // Create a longer road with gentle curves
    const roadLength = 1000;
    
    for (let i = 0; i < roadLength; i++) {
        // Smoother, gentler curves
        let curve = 0;
        if (i > 50 && i < 150) curve = 1.5;       // Gentle right
        if (i > 200 && i < 350) curve = -2;       // Left curve
        if (i > 400 && i < 500) curve = 2.5;      // Right curve
        if (i > 550 && i < 650) curve = -1.5;     // Gentle left
        if (i > 700 && i < 800) curve = 1;        // Slight right
        if (i > 850 && i < 950) curve = -2;       // Left curve
        
        // Gentler hills
        let y = 0;
        if (i > 100 && i < 180) y = Math.sin((i - 100) * Math.PI / 80) * 1000;
        if (i > 300 && i < 400) y = Math.sin((i - 300) * Math.PI / 100) * 800;
        if (i > 500 && i < 600) y = -Math.sin((i - 500) * Math.PI / 100) * 600;
        if (i > 750 && i < 850) y = Math.sin((i - 750) * Math.PI / 100) * 500;
        
        segments.push({
            index: i,
            p1: { world: { z: i * road.segmentLength, y: y }, camera: {}, screen: {} },
            p2: { world: { z: (i + 1) * road.segmentLength, y: y }, camera: {}, screen: {} },
            curve: curve,
            color: Math.floor(i / road.rumbleLength) % 2 ?
                { road: colors.road.dark, grass: colors.grass.dark, rumble: colors.rumble.dark } :
                { road: colors.road.light, grass: colors.grass.light, rumble: colors.rumble.light }
        });
    }
    
    // Make it loop
    segments[segments.length - 1].p2.world.z = 0;
}

// Project 3D point to 2D screen
function project(p, cameraX, cameraY, cameraZ, cameraDepth) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    
    const scale = cameraDepth / p.camera.z;
    p.screen.scale = scale;
    p.screen.x = Math.round(canvas.width / 2 + scale * p.camera.x * canvas.width / 2);
    p.screen.y = Math.round(canvas.height / 2 - scale * p.camera.y * canvas.height / 2);
    p.screen.w = Math.round(scale * road.width * canvas.width / 2);
}

// Get segment at position
function findSegment(z) {
    return segments[Math.floor(z / road.segmentLength) % segments.length];
}

// Draw a polygon
function polygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
}

// Render the road
function renderRoad() {
    const baseSegment = findSegment(player.z);
    const basePercent = (player.z % road.segmentLength) / road.segmentLength;
    const playerSegment = findSegment(player.z + road.cameraHeight);
    const playerPercent = ((player.z + road.cameraHeight) % road.segmentLength) / road.segmentLength;
    const playerY = playerSegment.p1.world.y + (playerSegment.p2.world.y - playerSegment.p1.world.y) * playerPercent;
    
    let maxy = canvas.height;
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);
    
    // Clear sky
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw horizon mountains/background
    ctx.fillStyle = '#4a8f4a';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    
    // Draw segments from back to front
    for (let n = 0; n < road.drawDistance; n++) {
        const index = (baseSegment.index + n) % segments.length;
        const segment = segments[index];
        const looped = segment.index < baseSegment.index;
        const fog = 1 / (1 + n * n * road.fogDensity * 0.00001);
        
        // Calculate road position
        const p1Z = looped ? segment.p1.world.z + segments.length * road.segmentLength : segment.p1.world.z;
        const p2Z = looped ? segment.p2.world.z + segments.length * road.segmentLength : segment.p2.world.z;
        
        // Project points
        segment.p1.world.x = x;
        project(segment.p1, player.x * road.width, playerY + road.cameraHeight, player.z, road.cameraDepth);
        
        x += dx;
        dx += segment.curve;
        
        segment.p2.world.x = x;
        project(segment.p2, player.x * road.width, playerY + road.cameraHeight, player.z, road.cameraDepth);
        
        // Skip if behind camera or above screen
        if (segment.p1.camera.z <= road.cameraDepth || segment.p2.screen.y >= maxy) continue;
        
        // Draw grass
        polygon(ctx,
            0, segment.p2.screen.y,
            canvas.width, segment.p2.screen.y,
            canvas.width, segment.p1.screen.y,
            0, segment.p1.screen.y,
            segment.color.grass);
        
        // Draw rumble strips
        const rumbleW1 = segment.p1.screen.w * 1.15;
        const rumbleW2 = segment.p2.screen.w * 1.15;
        polygon(ctx,
            segment.p1.screen.x - rumbleW1, segment.p1.screen.y,
            segment.p1.screen.x + rumbleW1, segment.p1.screen.y,
            segment.p2.screen.x + rumbleW2, segment.p2.screen.y,
            segment.p2.screen.x - rumbleW2, segment.p2.screen.y,
            segment.color.rumble);
        
        // Draw road
        polygon(ctx,
            segment.p1.screen.x - segment.p1.screen.w, segment.p1.screen.y,
            segment.p1.screen.x + segment.p1.screen.w, segment.p1.screen.y,
            segment.p2.screen.x + segment.p2.screen.w, segment.p2.screen.y,
            segment.p2.screen.x - segment.p2.screen.w, segment.p2.screen.y,
            segment.color.road);
        
        // Draw lane markings
        if (Math.floor(index / road.rumbleLength) % 2 === 0) {
            const laneW1 = segment.p1.screen.w * 0.02;
            const laneW2 = segment.p2.screen.w * 0.02;
            const laneX1 = segment.p1.screen.w * 0.33;
            const laneX2 = segment.p2.screen.w * 0.33;
            
            // Left lane marker
            polygon(ctx,
                segment.p1.screen.x - laneX1 - laneW1, segment.p1.screen.y,
                segment.p1.screen.x - laneX1 + laneW1, segment.p1.screen.y,
                segment.p2.screen.x - laneX2 + laneW2, segment.p2.screen.y,
                segment.p2.screen.x - laneX2 - laneW2, segment.p2.screen.y,
                colors.lane);
            
            // Right lane marker
            polygon(ctx,
                segment.p1.screen.x + laneX1 - laneW1, segment.p1.screen.y,
                segment.p1.screen.x + laneX1 + laneW1, segment.p1.screen.y,
                segment.p2.screen.x + laneX2 + laneW2, segment.p2.screen.y,
                segment.p2.screen.x + laneX2 - laneW2, segment.p2.screen.y,
                colors.lane);
        }
        
        maxy = segment.p2.screen.y;
    }
}

// Draw car dashboard/hood
function drawCar() {
    // Simple car hood at bottom of screen
    ctx.fillStyle = '#2266dd';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.2, canvas.height);
    ctx.lineTo(canvas.width * 0.35, canvas.height - 60);
    ctx.lineTo(canvas.width * 0.65, canvas.height - 60);
    ctx.lineTo(canvas.width * 0.8, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Hood shine
    ctx.fillStyle = '#3388ff';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.3, canvas.height);
    ctx.lineTo(canvas.width * 0.4, canvas.height - 40);
    ctx.lineTo(canvas.width * 0.6, canvas.height - 40);
    ctx.lineTo(canvas.width * 0.7, canvas.height);
    ctx.closePath();
    ctx.fill();
}

// Draw UI
function drawUI() {
    const speedMPH = Math.round(player.speed / player.maxSpeed * 200);
    
    // Speed display
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 140, 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SPEED', 20, 32);
    
    ctx.fillStyle = '#66ff66';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(speedMPH + ' mph', 20, 54);
    
    // Version display (to confirm latest version)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(canvas.width - 80, 10, 70, 25);
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('v' + VERSION, canvas.width - 70, 28);
    
    // Handbrake indicator
    if (keys.space) {
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillRect(160, 10, 100, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('HANDBRAKE', 168, 30);
    }
}

// Update game logic
function update(dt) {
    const segment = findSegment(player.z + road.cameraHeight);
    const speedPercent = player.speed / player.maxSpeed;
    const dx = dt * player.turnSpeed * speedPercent;
    
    // Steering
    if (keys.left) player.x -= dx;
    if (keys.right) player.x += dx;
    
    // Follow road curves
    player.x -= dx * speedPercent * segment.curve * 0.1;
    
    // Acceleration and braking
    if (keys.up) {
        player.speed += player.accel * dt;
    } else if (keys.down) {
        player.speed -= player.braking * dt;
    } else {
        player.speed -= player.decel * dt;
    }
    
    // Handbrake
    if (keys.space && player.speed > 0) {
        player.speed *= 0.95;
        if (keys.left) player.x -= dx * 2;
        if (keys.right) player.x += dx * 2;
    }
    
    // Off-road penalty
    if (Math.abs(player.x) > 0.8 && player.speed > player.offRoadLimit * player.maxSpeed) {
        player.speed -= player.offRoadDecel * dt;
    }
    
    // Clamp values
    player.speed = Math.max(0, Math.min(player.speed, player.maxSpeed));
    player.x = Math.max(-2, Math.min(2, player.x));
    
    // Move forward
    player.z += player.speed * dt;
    
    // Loop road
    const trackLength = segments.length * road.segmentLength;
    while (player.z >= trackLength) player.z -= trackLength;
    while (player.z < 0) player.z += trackLength;
}

// Main render function
function render() {
    renderRoad();
    drawCar();
    drawUI();
}

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
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.classList.add('active');
            if (key === 'space') {
                keys.space = true;
            } else {
                keys[key] = true;
            }
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (key === 'space') {
                keys.space = false;
            } else {
                keys[key] = false;
            }
        }, { passive: false });
        
        button.addEventListener('touchcancel', (e) => {
            button.classList.remove('active');
            if (key === 'space') {
                keys.space = false;
            } else {
                keys[key] = false;
            }
        });
        
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

// Initialize mobile controls
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileControls);
} else {
    setupMobileControls();
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
console.log('GTA 1 Style - First Person View - Starting...');
buildRoad();
requestAnimationFrame(gameLoop);
