/**
 * Particle Background System
 */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const PARTICLE_COLORS = ['#FF4215', '#FFD215', '#157BFF'];

// Handles resizing and HDPI displays
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    // Support high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Normalize coordinate system
    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
        // Randomize initial life so they don't all fade together at the start
        this.life = Math.random() * this.maxLife;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // Starts small and clear
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;

        this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.4 + 0.15; // Smooth elegance

        this.life = 0;
        this.maxLife = Math.random() * 400 + 300; // Duration (frames)

        // Slow drifting motion
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;

        this.blur = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        // Lifecycle: Fade in -> Float -> Blur, Expand & Fade out
        const progress = this.life / this.maxLife;

        if (progress < 0.2) {
            // Fade in phase
            this.opacity = (progress / 0.2) * this.maxOpacity;
            this.size = this.baseSize;
            this.blur = 0;
        } else if (progress > 0.6) {
            // Fade out, blur, expand phase
            const fadeProgress = (progress - 0.6) / 0.4;
            this.opacity = this.maxOpacity * (1 - fadeProgress);
            this.size = this.baseSize + (fadeProgress * 6); // Grow as it dissipates
            this.blur = fadeProgress * 15; // Increased blur for that dreamy out-of-focus look
        } else {
            // Stable phase
            this.opacity = this.maxOpacity;
            this.size = this.baseSize;
            this.blur = 0;
        }

        if (this.life >= this.maxLife) {
            this.reset();
        }
    }

    draw() {
        if (this.opacity <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.blur > 0) {
            ctx.shadowBlur = this.blur;
            ctx.shadowColor = this.color;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    // Dynamic density based on screen area
    const density = 20000;
    const numParticles = Math.max(30, Math.floor((width * height) / density));

    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
        p.update();
        p.draw();
    }
    requestAnimationFrame(animateParticles);
}

// Initial Kickoff
initParticles();
animateParticles();


/**
 * Dialogue Logic State Machine
 */
const TYPING_SPEED_MS = 35; // Typewriter effect speed
let typingTimeout = null;

const uiElements = {
    img: document.getElementById('character-img'),
    text: document.getElementById('dialogue-text'),
    controls: document.getElementById('controls-container')
};

// Scene definitions — images live in images/ subfolder
const scenes = {
    start: {
        img: 'images/catGreet.png',
        text: "Hi! I'm Maple. Welcome to my home. Is it your first time here?",
        controls: () => `
            <button class="choice-btn" onclick="handleChoice('Yes')">Yes</button>
            <button class="choice-btn" onclick="handleChoice('No')">No</button>
        `
    },
    fee_yes: {
        img: 'images/catPraise.png',
        text: "Brilliant! You should pay the entrance fee. Type in the box to pay.",
        controls: () => `
            <div class="input-group">
                <div class="input-row">
                    <input type="text" id="fee-input" class="text-input" placeholder="Type here..." autocomplete="off">
                    <button class="submit-btn" id="fee-submit">➜</button>
                </div>
                <img class="input-hint-img" src="images/You_have_the_best_domain_ever.PNG" alt="hint" draggable="false">
            </div>
        `,
        setup: () => {
            const input = document.getElementById('fee-input');
            const btn = document.getElementById('fee-submit');
            input.focus();
            const attempt = () => {
                if (input.value === "You have the best domain ever!") {
                    transitionTo('scene2_intro');
                } else {
                    triggerInputError(input);
                }
            };
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') attempt();
            });
            btn.addEventListener('click', attempt);
        }
    },
    fee_no: {
        img: 'images/catPraise.png',
        text: "Glad that you're back! Did I tell you last time every time there's an entrance fee?",
        controls: () => `
            <div class="input-group">
                <div class="input-row">
                    <input type="text" id="fee-input" class="text-input" placeholder="Type here..." autocomplete="off">
                    <button class="submit-btn" id="fee-submit">➜</button>
                </div>
                <img class="input-hint-img" src="images/Your_works_are_amazing.PNG" alt="hint" draggable="false">
            </div>
        `,
        setup: () => {
            const input = document.getElementById('fee-input');
            const btn = document.getElementById('fee-submit');
            input.focus();
            const attempt = () => {
                if (input.value === "Your works are amazing!") {
                    transitionTo('scene2_intro');
                } else {
                    triggerInputError(input);
                }
            };
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') attempt();
            });
            btn.addEventListener('click', attempt);
        }
    },
    scene2_intro: {
        img: 'images/catIce.png',
        text: "Th-ake wooer tyme to wook around. Woo can gek ph-ree eyss kreem ewee-where.",
        controls: () => `
            <button class="choice-btn" onclick="handleChoice('Thank you')">Thank you</button>
        `
    },
    scene2_blank: {
        img: 'images/catIce.png',
        text: "...",
        controls: () => ""
    }
};

function triggerInputError(inputEl) {
    inputEl.classList.remove('error');
    // Force reflow to restart animation
    void inputEl.offsetWidth;
    inputEl.classList.add('error');
}

/**
 * Typewriter text effect
 */
function typeText(text, onComplete) {
    uiElements.text.textContent = ''; // clear text
    let index = 0;

    function typeNextChar() {
        if (index < text.length) {
            uiElements.text.textContent += text.charAt(index);
            index++;
            typingTimeout = setTimeout(typeNextChar, TYPING_SPEED_MS);
        } else if (onComplete) {
            onComplete();
        }
    }

    clearTimeout(typingTimeout);
    typeNextChar();
}

/**
 * Main State Transition System
 */
function transitionTo(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) return;

    // 1. Hide current controls smoothly
    uiElements.controls.style.opacity = 0;

    // Wait for controls to fade out
    setTimeout(() => {
        // 2. Clear old controls from memory
        uiElements.controls.innerHTML = '';

        // 3. Swap Character Image if needed
        if (!uiElements.img.src.includes(scene.img)) {
            uiElements.img.style.opacity = 0;
            setTimeout(() => {
                uiElements.img.src = scene.img;
                uiElements.img.style.opacity = 1;
            }, 300); // Wait for image fade out
        }

        // 4. Type text
        typeText(scene.text, () => {
            // 5. Setup new controls and fade them in
            uiElements.controls.innerHTML = scene.controls();
            if (scene.setup) scene.setup();
            uiElements.controls.style.opacity = 1;
        });

    }, 300); // 300ms matches CSS transition timing
}

// Global hook for inline HTML onclick handlers
window.handleChoice = function (choice) {
    if (choice === 'Yes') {
        transitionTo('fee_yes');
    } else if (choice === 'No') {
        transitionTo('fee_no');
    } else if (choice === 'Thank you') {
        startScene2();
    }
};

// Start the sequence shortly after load
window.addEventListener('load', () => {
    // Small delay to let initial animations finish
    setTimeout(() => {
        transitionTo('start');
    }, 800);
});


// ============================================================
//  SCENE 2 — Top-down 2D Gallery Game
// ============================================================

// ---- World & Physics Constants ----
const WORLD_W = 1400;
const WORLD_H = 1120;
const WALL_T = 8;      // wall thickness (px)
const DOOR_GAP = 80;     // doorway opening width
const PLAYER_RADIUS = 24;     // player circle radius
const PLAYER_SPEED = 3;      // px per frame
const EXHIBIT_W = 40;     // exhibit frame width
const EXHIBIT_H = 50;     // exhibit frame height
const EXHIBIT_DIST = 80;     // interaction trigger distance
const SONG_RADIUS = 32;     // collectible circle radius
const SONG_DIST = 30;     // collection trigger distance

// ---- Outer boundary constants ----
const OB = { left: 50, right: 1350, top: 70, bottom: 1080 };

// ---- Game Runtime State ----
let gameCanvas2 = null;  // renamed to avoid clash with bg-canvas `canvas`
let gCtx = null;
let gameRunning = false;

// ---- Input ----
const keys2 = {};  // keyboard state (renamed to avoid conflicts)

// ---- Camera (top-left corner of viewport in world space) ----
let camX = 0, camY = 0;

// ---- Player ----
// dir: facing direction used for sprite selection ('left'|'right'|'up'|'down')
const player = { x: 700, y: 555, dir: 'down' };

// ---- Player Sprites (loaded on demand; avatar/ folder) ----
const playerSprites = { left: null, right: null, up: null, down: null };
const SPRITE_PATHS = {
    left: 'avatar/left.PNG',
    right: 'avatar/right.PNG',
    up: 'avatar/back.PNG',
    down: 'avatar/front.PNG',
};
Object.entries(SPRITE_PATHS).forEach(([dir, path]) => {
    const img = new Image();
    img.src = path;
    img.onload = () => { playerSprites[dir] = img; };
    img.onerror = () => { /* silently fall back to drawn cat */ };
});

// ---- Progress ----
let songsCollected = 0;
let secretDoorOpen = false;

// ---- Popup timer (ms remaining) ----
let popupTimer = 0;

// ---- Which exhibit the player is closest to (if in range) ----
let nearestExhibit = null;

// ---- Scene 2 background image ----
let bgImage = null;
const _bgImg = new Image();
_bgImg.src = 'images/background.png';
_bgImg.onload = () => { bgImage = _bgImg; };

// ---- Ice cream cat image (preloaded) ----
let iceCatImage = null;
const _iceCatImg = new Image();
_iceCatImg.src = 'images/catIce.png';
_iceCatImg.onload = () => { iceCatImage = _iceCatImg; };

// ---- Ice cream exhibit frame images (ice_cream/ice1–6.PNG, randomised per exhibit) ----
const ICE_IMAGES = Array.from({ length: 6 }, (_, i) => {
    const img = new Image();
    img.src = `ice_cream/ice${i + 1}.PNG`;
    return img;
});

// ---- Song collectible images (daisy / sea / space) ----
const SONG_IMAGES = {};
[['daisy', 'images/daisy.PNG'], ['sea', 'images/sea.PNG'], ['space', 'images/space.PNG']].forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    SONG_IMAGES[key] = img;
});

// ---- Paw icon image (shown near exhibits instead of eye) ----
let pawImage = null;
const _pawImg = new Image();
_pawImg.src = 'images/paw.PNG';
_pawImg.onload = () => { pawImage = _pawImg; };
_pawImg.onerror = () => { /* silently fall back to eye */ };

// ---- Audio player state ----
let collectedSongs = [];    // ordered list of collected song objects
let currentSongIdx = -1;    // index into collectedSongs
let currentAudio = null;  // active HTML Audio instance
let songDropdownOpen = false;


// ---- Room Definitions ----
// Layout (world 1400×1120, playable 50..1350, 70..1080):
//   Top row    y: 80–450   (h=370)   Left col x: 55–525 (w=470), Right col x: 875–1345 (w=470)
//   Corridor   y: 450–650  (h=200)
//   Bottom row y: 650–1020 (h=370)
// doorGapCx: x-centre of doorway opening (off-centre toward the corridor so rooms face each other)
// entered: revealed when player walks in; solid rooms are always open (ice cream counter)
const ROOMS = [
    {
        id: 'culinary', label: 'culinary', x: 55, y: 80, w: 470, h: 370,
        color: '#FFF3DC', doorSide: 'bottom', doorGapCx: 55 + 470 * 0.78, entered: false
    },
    {
        id: 'iceCream', label: 'Ice Cream', x: 600, y: 95, w: 200, h: 185,
        color: '#E8F6FF', solid: true
    },
    {
        id: 'design', label: 'design room', x: 875, y: 80, w: 470, h: 370,
        color: '#EDFFF0', doorSide: 'bottom', doorGapCx: 875 + 470 * 0.22, entered: false
    },
    {
        id: 'illustration', label: 'illustration', x: 55, y: 650, w: 470, h: 370,
        color: '#FFEDF5', doorSide: 'top', doorGapCx: 55 + 470 * 0.78, entered: false
    },
    {
        id: 'poetry', label: 'poetry', x: 875, y: 650, w: 470, h: 370,
        color: '#F5EDFF', doorSide: 'top', doorGapCx: 875 + 470 * 0.22, entered: false
    },
];

// ---- Exhibit Definitions ----
// Placed ~30px inside room walls; y≈room.y+30 for top wall, x≈room.x+30 for left wall
const EXHIBITS = [
    // Culinary  (x: 55–525, y: 80–450) — top wall & left wall
    { id: 'c1', roomId: 'culinary', label: 'Tamagoyaki',   x: 140, y: 115, imgSrc: 'rooms/culinary/BananaMage.png'       },
    { id: 'c2', roomId: 'culinary', label: 'Chawanmushi',  x: 250, y: 115, imgSrc: 'rooms/culinary/ChatGPTDot.png'       },
    { id: 'c3', roomId: 'culinary', label: 'Matcha Roll',  x: 410, y: 115, imgSrc: 'rooms/culinary/Hamwich.png'          },
    { id: 'c4', roomId: 'culinary', label: 'Mochi Daifuku',x:  90, y: 240, imgSrc: 'rooms/culinary/HotdogToothpaste.png' },
    { id: 'c5', roomId: 'culinary', label: 'Onigiri',      x:  90, y: 380, imgSrc: 'rooms/culinary/ItalyPasta.png'       },
    // Design    (x: 875–1345, y: 80–450) — top wall & right wall
    { id: 'd1', roomId: 'design', label: 'Brand Identity', x:  960, y: 115, imgSrc: 'rooms/design/AGIHoodie.png'         },
    { id: 'd2', roomId: 'design', label: 'UI System',      x: 1080, y: 115, imgSrc: 'rooms/design/FoxtailVase.png'       },
    { id: 'd3', roomId: 'design', label: 'Poster Series',  x: 1240, y: 115, imgSrc: 'rooms/design/GoldenRatio.png'       },
    { id: 'd4', roomId: 'design', label: 'Typography',     x: 1310, y: 240, imgSrc: 'rooms/design/MagrittePhoneCase.png' },
    // Illustration (x: 55–525, y: 650–1020) — top wall & left wall
    { id: 'i1', roomId: 'illustration', label: 'Forest Spirit',  x: 140, y: 685, imgSrc: 'rooms/illustration/BriefSpring.png'   },
    { id: 'i2', roomId: 'illustration', label: 'Starlight Cat',  x: 250, y: 685, imgSrc: 'rooms/illustration/ImBach.GIF'        },
    { id: 'i3', roomId: 'illustration', label: 'Ocean Dreamer',  x: 410, y: 685, imgSrc: 'rooms/illustration/Neowsletter.png'   },
    { id: 'i4', roomId: 'illustration', label: 'Paper Cranes',   x:  90, y: 810, imgSrc: 'rooms/illustration/PiecedAnimals.png' },
    // Poetry    (x: 875–1345, y: 650–1020) — four poems on the walls
    { id: 'p1', roomId: 'poetry', label: 'I',   x:  960, y: 685, iceImgIdx: 0,
      poem: "Today I shall die.\nPlease with\nDandelions,\nWith dandelions fill,\nFill them please!\nDandelions,\nWithin\nMy grave.\nA soft bed\nLaden with\nSoft dreams." },
    { id: 'p2', roomId: 'poetry', label: 'II',  x: 1080, y: 685, iceImgIdx: 1,
      poem: "A face of clay.\nPinched, pulled, punched, pummeled-\nIs it but the toil of reform?\nHah!\nInborn in my body is\nA seed of ill omen.\n\nThe blaze of hope.\nScathed, scorched, singed, seared-\nHas it ushered in a pristine rebirth?\nNay!\nWhen the fruit breaks it's the life\nFlashing before one's eyes." },
    { id: 'p3', roomId: 'poetry', label: 'III', x: 1210, y: 685, iceImgIdx: 2,
      poem: "In the subway I sat on\nA seat between\nSeats.\nI leaned forward and saw the compartments\nA tunnel of\nPeople, their waves.\nNo one was talking so the\nSilence stretched my loneliness.\nBut I realized that\nLoneliness is everyone's\nOpen secret." },
    { id: 'p4', roomId: 'poetry', label: 'IV',  x: 1310, y: 790, iceImgIdx: 3,
      poem: "Looking up at an osmanthus tree:\nYou must love me, or\nFluttering down those sweet\nKisses,\nWhy are they chasing me?" },
];

// Preload room artwork images for exhibits that have imgSrc
EXHIBITS.forEach(ex => {
    if (ex.imgSrc) {
        const img = new Image();
        img.src = ex.imgSrc;
        ex._img = img;
    }
});

// Assign ice_cream images to exhibits — fixed cycle (skip exhibits that already have iceImgIdx set)
EXHIBITS.forEach((ex, i) => { if (ex.iceImgIdx === undefined) ex.iceImgIdx = i % 6; });

// ---- Song Collectibles (one per room, centred inside) ----
const SONGS = [
    { id: 's1', x: 290, y: 265, color: '#FFD215', collected: false, name: 'Minor Daisy Bell', file: 'music/minorDaisyBell.mp3', imgKey: 'daisy', roomId: 'culinary' },
    { id: 's2', x: 290, y: 835, color: '#FF4215', collected: false, name: 'Lighthouse By The Sea', file: 'music/lighthouseBytheSea.mp3', imgKey: 'sea', roomId: 'illustration' },
    { id: 's3', x: 1110, y: 265, color: '#157BFF', collected: false, name: 'A Space Odyssey', file: 'music/aSpaceOdyssey.mp3', imgKey: 'space', roomId: 'design' },
];

// ---- Mobile Joystick ----
const joystick = {
    active: false,
    touchId: null,
    baseX: 80,   // fixed screen-space position
    baseY: 0,    // set after canvas resize
    stickX: 80,
    stickY: 0,
    BASE_R: 50,
    STICK_R: 25,
};

// ---- Collision Wall Rectangles ----
// Built once from the room definitions.
let wallRects = [];

/**
 * Build all AABB wall rectangles for the lobby + rooms.
 * Call once during initGame().
 */
function buildWalls() {
    wallRects = [];

    // --- Outer lobby walls ---
    const iceRoom = ROOMS.find(r => r.id === 'iceCream');
    const sDoorCx = iceRoom.x + iceRoom.w / 2;
    const sDoorL = sDoorCx - DOOR_GAP / 2;
    const sDoorR = sDoorCx + DOOR_GAP / 2;

    // Top wall — left segment
    wallRects.push({ x: OB.left, y: OB.top, w: sDoorL - OB.left, h: WALL_T });
    // Top wall — secret door segment (flagged so collision can be skipped when open)
    wallRects.push({ x: sDoorL, y: OB.top, w: DOOR_GAP, h: WALL_T, isSecretDoor: true });
    // Top wall — right segment
    wallRects.push({ x: sDoorR, y: OB.top, w: OB.right - sDoorR, h: WALL_T });

    wallRects.push({ x: OB.left, y: OB.bottom, w: OB.right - OB.left, h: WALL_T }); // bottom
    wallRects.push({ x: OB.left, y: OB.top, w: WALL_T, h: OB.bottom - OB.top }); // left
    wallRects.push({ x: OB.right, y: OB.top, w: WALL_T, h: OB.bottom - OB.top }); // right

    // --- Ice cream counter — solid block ---
    const ice = ROOMS.find(r => r.solid);
    if (ice) {
        wallRects.push({ x: ice.x, y: ice.y, w: ice.w, h: ice.h });
    }

    // --- Room walls (non-solid only) ---
    for (const room of ROOMS) {
        if (!room.solid) addRoomWalls(room);
    }
}

/**
 * Emit AABB wall rects for one room.
 * The gap (doorway) uses room.doorGapCx when set, otherwise centres on the wall.
 */
function addRoomWalls(room) {
    const { x, y, w, h, doorSide } = room;
    const T = WALL_T;
    const gapCx = room.doorGapCx !== undefined ? room.doorGapCx : x + w / 2;
    const gapL = gapCx - DOOR_GAP / 2;
    const gapR = gapCx + DOOR_GAP / 2;

    // Helper — push either a full wall or two half-walls with a gap
    const pushWall = (side) => {
        const hasDoor = (side === doorSide);
        if (side === 'top') {
            if (hasDoor) {
                wallRects.push({ x: x - T, y: y - T, w: gapL - (x - T), h: T });
                wallRects.push({ x: gapR, y: y - T, w: (x + w + T) - gapR, h: T });
            } else {
                wallRects.push({ x: x - T, y: y - T, w: w + 2 * T, h: T });
            }
        } else if (side === 'bottom') {
            if (hasDoor) {
                wallRects.push({ x: x - T, y: y + h, w: gapL - (x - T), h: T });
                wallRects.push({ x: gapR, y: y + h, w: (x + w + T) - gapR, h: T });
            } else {
                wallRects.push({ x: x - T, y: y + h, w: w + 2 * T, h: T });
            }
        }
    };

    pushWall('top');
    pushWall('bottom');
    // Side walls span full height including corners
    wallRects.push({ x: x - T, y: y - T, w: T, h: h + 2 * T }); // left
    wallRects.push({ x: x + w, y: y - T, w: T, h: h + 2 * T }); // right
}

// ---- Collision Detection ----

/** True if a circle (cx,cy,r) overlaps an AABB rect. */
function circleVsRect(cx, cy, r, rect) {
    const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - nearX;
    const dy = cy - nearY;
    return dx * dx + dy * dy < r * r;
}

/**
 * Resolve player movement: try to slide along walls rather than stopping dead.
 * Returns the final {x, y} after resolution.
 */
function resolveMove(newX, newY) {
    let rx = newX, ry = newY;

    for (const wall of wallRects) {
        if (wall.isSecretDoor && secretDoorOpen) continue;

        if (circleVsRect(rx, ry, PLAYER_RADIUS, wall)) {
            // Try sliding on X axis only (revert X)
            if (!circleVsRect(player.x, ry, PLAYER_RADIUS, wall)) {
                rx = player.x;
            }
            // Try sliding on Y axis only (revert Y)
            else if (!circleVsRect(rx, player.y, PLAYER_RADIUS, wall)) {
                ry = player.y;
            }
            // Fully blocked — revert both
            else {
                rx = player.x;
                ry = player.y;
            }
        }
    }
    return { x: rx, y: ry };
}


// ============================================================
//  Entry Point: called when "Thank you" is clicked in Scene 1
// ============================================================

function startScene2() {
    const sceneEl = document.getElementById('scene-container');
    const bgCanvas = document.getElementById('bg-canvas');
    const footer = document.getElementById('copyright');

    // Fade out Scene 1 UI
    sceneEl.style.transition = 'opacity 1s ease';
    sceneEl.style.opacity = '0';
    bgCanvas.style.transition = 'opacity 1s ease';
    bgCanvas.style.opacity = '0';
    if (footer) footer.style.transition = 'opacity 1s ease', footer.style.opacity = '0';

    setTimeout(() => {
        sceneEl.style.display = 'none';

        // Show game canvas + song player widget
        gameCanvas2 = document.getElementById('game-canvas');
        gameCanvas2.style.display = 'block';
        document.getElementById('song-player').style.display = 'flex';

        initGame();
    }, 1000);
}


// ============================================================
//  Game Initialization
// ============================================================

function initGame() {
    gCtx = gameCanvas2.getContext('2d');
    resizeGame();
    window.addEventListener('resize', resizeGame);

    // Keyboard
    window.addEventListener('keydown', e => {
        keys2[e.key] = true;
        // Space → interact with nearest exhibit
        if (e.code === 'Space' && nearestExhibit) {
            e.preventDefault();
            openModal(nearestExhibit);
        }
    });
    window.addEventListener('keyup', e => { keys2[e.key] = false; });

    // Touch — joystick
    gameCanvas2.addEventListener('touchstart', onTouchStart, { passive: false });
    gameCanvas2.addEventListener('touchmove', onTouchMove, { passive: false });
    gameCanvas2.addEventListener('touchend', onTouchEnd, { passive: false });

    // Exhibit modal close button
    document.getElementById('exhibit-close-btn').addEventListener('click', closeModal);
    document.getElementById('poem-close-btn').addEventListener('click', closeModal);
    document.getElementById('artwork-close-btn').addEventListener('click', closeModal);
    // Click on interact hint to open on mobile
    document.getElementById('interact-hint').addEventListener('click', () => {
        if (nearestExhibit) openModal(nearestExhibit);
    });

    buildWalls();
    initSongPlayer();

    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function resizeGame() {
    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    gameCanvas2.width = vw * dpr;
    gameCanvas2.height = vh * dpr;
    gameCanvas2.style.width = vw + 'px';
    gameCanvas2.style.height = vh + 'px';
    gCtx.scale(dpr, dpr);

    // Anchor joystick to bottom-left in screen space
    joystick.baseY = vh - 80;
    joystick.stickY = joystick.baseY;
}


// ============================================================
//  Game Loop
// ============================================================

function gameLoop() {
    if (!gameRunning) return;
    update();
    render();
    requestAnimationFrame(gameLoop);
}


// ============================================================
//  Update
// ============================================================

function update() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // --- Movement input ---
    let dx = 0, dy = 0;
    if (keys2['ArrowLeft'] || keys2['a'] || keys2['A']) dx -= PLAYER_SPEED;
    if (keys2['ArrowRight'] || keys2['d'] || keys2['D']) dx += PLAYER_SPEED;
    if (keys2['ArrowUp'] || keys2['w'] || keys2['W']) dy -= PLAYER_SPEED;
    if (keys2['ArrowDown'] || keys2['s'] || keys2['S']) dy += PLAYER_SPEED;

    // Joystick contribution
    if (joystick.active) {
        const jdx = joystick.stickX - joystick.baseX;
        const jdy = joystick.stickY - joystick.baseY;
        const len = Math.sqrt(jdx * jdx + jdy * jdy);
        if (len > 6) {
            dx += (jdx / len) * PLAYER_SPEED;
            dy += (jdy / len) * PLAYER_SPEED;
        }
    }

    // Normalise diagonal speed
    if (dx !== 0 && dy !== 0) {
        const f = 1 / Math.SQRT2;
        dx *= f; dy *= f;
    }

    // Collision resolution
    if (dx !== 0 || dy !== 0) {
        const resolved = resolveMove(player.x + dx, player.y + dy);
        player.x = resolved.x;
        player.y = resolved.y;

        // Update facing direction for sprite rendering
        // Prefer the dominant axis; fall back to last direction
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
            player.dir = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0) {
            player.dir = dy > 0 ? 'down' : 'up';
        }
    }

    // --- Room entry tracking (reveal while inside, hide again when leaving) ---
    for (const room of ROOMS) {
        if (room.solid) continue;
        room.entered = (player.x > room.x && player.x < room.x + room.w &&
            player.y > room.y && player.y < room.y + room.h);
    }

    // --- Camera: centre on player, clamped to world bounds ---
    camX = Math.max(0, Math.min(player.x - vw / 2, WORLD_W - vw));
    camY = Math.max(0, Math.min(player.y - vh / 2, WORLD_H - vh));

    // --- Song collection ---
    for (const song of SONGS) {
        if (song.collected) continue;
        if (Math.hypot(player.x - song.x, player.y - song.y) < SONG_DIST + SONG_RADIUS) {
            song.collected = true;
            songsCollected++;
            collectedSongs.push(song);
            playSong(song);
            if (songsCollected >= 3) {
                secretDoorOpen = true;
                showToast('🔓 Secret room unlocked!');
            } else {
                showToast(`♪ ${song.name}`);
            }
        }
    }

    // --- Nearest exhibit (for interact hint & Space key) ---
    nearestExhibit = null;
    let minDist = EXHIBIT_DIST;
    for (const ex of EXHIBITS) {
        const d = Math.hypot(player.x - ex.x, player.y - ex.y);
        if (d < minDist) { minDist = d; nearestExhibit = ex; }
    }

    // Show or hide the interact hint
    const hintEl = document.getElementById('interact-hint');
    const modalEl = document.getElementById('exhibit-modal');
    const showHint = nearestExhibit && !modalEl.classList.contains('visible');
    hintEl.style.display = showHint ? 'block' : 'none';

    // Sync vinyl disk spinning state every frame
    const diskEl = document.getElementById('vinyl-disk');
    if (diskEl) {
        const isPlaying = currentAudio && !currentAudio.paused && !currentAudio.ended;
        diskEl.classList.toggle('spinning', !!isPlaying);
    }

    // Tick popup timer
    if (popupTimer > 0) {
        popupTimer -= 16;
        if (popupTimer <= 0) document.getElementById('song-popup').style.display = 'none';
    }
}


// ============================================================
//  Render
// ============================================================

function render() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Clear with warm background
    gCtx.clearRect(0, 0, vw, vh);

    // Apply camera transform — everything in world space below
    gCtx.save();
    gCtx.translate(-camX, -camY);

    // Background image drawn 50% larger than the world, centered
    if (bgImage) {
        const bw = WORLD_W * 1.5, bh = WORLD_H * 1.5;
        gCtx.drawImage(bgImage, -(bw - WORLD_W) / 2, -(bh - WORLD_H) / 2, bw, bh);
    } else {
        gCtx.fillStyle = '#FFFAE8';
        gCtx.fillRect(0, 0, WORLD_W, WORLD_H);
    }

    drawLobbyFloor();
    ROOMS.forEach(drawRoom);
    drawOuterLobbyWalls();
    drawSecretDoorArea();
    SONGS.forEach(s => { if (!s.collected) drawSong(s); });
    EXHIBITS.forEach(drawExhibit);
    drawIceCreamCat();
    drawPlayer();

    gCtx.restore();

    // Joystick is drawn in screen space (no camera)
    drawJoystick();
}

// ---- Draw Helpers ----

function seg(x1, y1, x2, y2) {
    gCtx.beginPath();
    gCtx.moveTo(x1, y1);
    gCtx.lineTo(x2, y2);
    gCtx.stroke();
}

function drawLobbyFloor() {
    gCtx.fillStyle = '#FFF8E0';
    gCtx.fillRect(OB.left, OB.top, OB.right - OB.left, OB.bottom - OB.top);
}

/**
 * Draw a single room.
 *
 * Solid rooms (ice cream counter): hatched fill + outline, no door, no label.
 * Regular rooms: opaque label overlay until entered, then lighter floor revealed.
 */
function drawRoom(room) {
    const { x, y, w, h, color } = room;

    // ── Ice cream counter (solid obstacle) ──────────────────────────────────
    if (room.solid) {
        gCtx.fillStyle = color;
        gCtx.fillRect(x, y, w, h);
        gCtx.strokeStyle = '#444';
        gCtx.lineWidth = WALL_T;
        gCtx.lineCap = 'square';
        gCtx.strokeRect(x + WALL_T / 2, y + WALL_T / 2, w - WALL_T, h - WALL_T);
        return;
    }

    // ── Regular rooms ────────────────────────────────────────────────────────
    const doorSide = room.doorSide;
    const gapCx = room.doorGapCx !== undefined ? room.doorGapCx : x + w / 2;
    const gapL = gapCx - DOOR_GAP / 2;
    const gapR = gapCx + DOOR_GAP / 2;

    // Floor
    gCtx.fillStyle = color;
    gCtx.fillRect(x, y, w, h);

    if (!room.entered) {
        // Opaque overlay: hide interior, show label
        gCtx.save();
        gCtx.fillStyle = 'rgba(20, 18, 15, 0.52)';
        gCtx.fillRect(x, y, w, h);
        gCtx.restore();

        gCtx.fillStyle = 'rgba(255, 248, 235, 0.92)';
        gCtx.font = '600 24px Dream, sans-serif';
        gCtx.textAlign = 'center';
        gCtx.letterSpacing = '3px';
        gCtx.fillText(room.label, x + w / 2, y + h / 2 + 9);
        gCtx.letterSpacing = '0px';
    } else {
        // Doormat hint at entrance
        gCtx.fillStyle = 'rgba(190, 165, 140, 0.35)';
        if (doorSide === 'bottom') gCtx.fillRect(gapL, y + h - 4, DOOR_GAP, 14);
        else gCtx.fillRect(gapL, y - 10, DOOR_GAP, 14);
    }

    // Walls
    gCtx.strokeStyle = '#333';
    gCtx.lineWidth = WALL_T;
    gCtx.lineCap = 'square';

    if (doorSide === 'top') {
        seg(x - WALL_T / 2, y, gapL, y);
        seg(gapR, y, x + w + WALL_T / 2, y);
    } else {
        seg(x - WALL_T / 2, y, x + w + WALL_T / 2, y);
    }
    if (doorSide === 'bottom') {
        seg(x - WALL_T / 2, y + h, gapL, y + h);
        seg(gapR, y + h, x + w + WALL_T / 2, y + h);
    } else {
        seg(x - WALL_T / 2, y + h, x + w + WALL_T / 2, y + h);
    }
    seg(x, y - WALL_T / 2, x, y + h + WALL_T / 2);
    seg(x + w, y - WALL_T / 2, x + w, y + h + WALL_T / 2);
}

/**
 * Draw the outer lobby boundary walls.
 * The top wall includes the secret-door gap.
 */
function drawOuterLobbyWalls() {
    // Walls are transparent — collision is handled by wallRects, not visuals
}

/**
 * Draw the secret door indicator (lock icon or glow when open).
 */
function drawSecretDoorArea() {
    const iceRoom = ROOMS.find(r => r.id === 'iceCream');
    const sDCx = iceRoom.x + iceRoom.w / 2;
    const sDL = sDCx - DOOR_GAP / 2;

    if (secretDoorOpen) {
        // Golden glow over the open gap
        gCtx.save();
        gCtx.shadowBlur = 24;
        gCtx.shadowColor = '#FFD215';
        gCtx.fillStyle = 'rgba(255, 210, 21, 0.4)';
        gCtx.fillRect(sDL, OB.top - 6, DOOR_GAP, 16);
        gCtx.restore();

        gCtx.fillStyle = '#B8860B';
        gCtx.font = '600 11px Dream, sans-serif';
        gCtx.textAlign = 'center';
        gCtx.fillText('✨ SECRET', sDCx, OB.top - 8);
    } else {
        // Lock icon + progress label
        gCtx.font = '14px sans-serif';
        gCtx.textAlign = 'center';
        gCtx.fillText('🔒', sDCx, OB.top + 8);

        gCtx.fillStyle = 'rgba(140,120,100,0.8)';
        gCtx.font = '11px Dream, sans-serif';
        gCtx.fillText(`${songsCollected}/3 songs`, sDCx, OB.top - 2);
    }
}

/**
 * Draw a collectible song pickup (music note in a glowing circle).
 */
function drawSong(song) {
    // Hide if the song is inside a room the player hasn't entered
    if (song.roomId) {
        const parentRoom = ROOMS.find(r => r.id === song.roomId);
        if (parentRoom && !parentRoom.entered) return;
    }

    const songImg = SONG_IMAGES[song.imgKey];
    const sz = SONG_RADIUS * 2;

    gCtx.save();
    // Yellow glow around the image shape (no filled circle)
    gCtx.shadowBlur  = 22;
    gCtx.shadowColor = '#FFD215';
    if (songImg && songImg.complete && songImg.naturalWidth > 0) {
        gCtx.drawImage(songImg, song.x - sz / 2, song.y - sz / 2, sz, sz);
    } else {
        // Fallback: plain ♪ with glow
        gCtx.fillStyle    = '#FFD215';
        gCtx.font         = `bold ${SONG_RADIUS}px sans-serif`;
        gCtx.textAlign    = 'center';
        gCtx.textBaseline = 'middle';
        gCtx.fillText('♪', song.x, song.y);
        gCtx.textBaseline = 'alphabetic';
    }
    gCtx.restore();
}

/**
 * Draw a minimalistic eye icon using canvas 2D drawing commands.
 * Blue oval outline + filled pupil — no emoji.
 * @param {number} cx - center X in world space
 * @param {number} cy - center Y in world space
 */
function drawEyeIcon(cx, cy) {
    const ew = 16, eh = 10;
    gCtx.save();
    gCtx.strokeStyle = '#157BFF';
    gCtx.fillStyle = '#157BFF';
    gCtx.lineWidth = 1.8;

    // Eye outline (oval)
    gCtx.beginPath();
    gCtx.ellipse(cx, cy, ew / 2, eh / 2, 0, 0, Math.PI * 2);
    gCtx.stroke();

    // Pupil
    gCtx.beginPath();
    gCtx.arc(cx, cy, 3, 0, Math.PI * 2);
    gCtx.fill();

    // Tiny highlight
    gCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    gCtx.beginPath();
    gCtx.arc(cx - 1, cy - 1, 1, 0, Math.PI * 2);
    gCtx.fill();

    gCtx.restore();
}

/**
 * Draw an exhibit on the wall — frameless ice cream image.
 * Hidden while the player is outside the room.
 * Shows a paw icon when the player is close enough to interact.
 */
function drawExhibit(ex) {
    const parentRoom = ROOMS.find(r => r.id === ex.roomId);
    if (parentRoom && !parentRoom.entered) return; // hidden behind opaque overlay
    const { x, y, comingSoon } = ex;
    const hw = EXHIBIT_W / 2;
    const hh = EXHIBIT_H / 2;

    if (comingSoon) {
        gCtx.fillStyle = 'rgba(180,180,180,0.5)';
        gCtx.fillRect(x - hw, y - hh, EXHIBIT_W, EXHIBIT_H);
        gCtx.fillStyle = '#888';
        gCtx.font = '14px sans-serif';
        gCtx.textAlign = 'center';
        gCtx.textBaseline = 'middle';
        gCtx.fillText('?', x, y);
        gCtx.textBaseline = 'alphabetic';
    } else {
        // Always show ice cream icon as the wall marker
        const iceImg = ICE_IMAGES[ex.iceImgIdx];
        if (iceImg && iceImg.complete && iceImg.naturalWidth > 0) {
            gCtx.drawImage(iceImg, x - hw, y - hh, EXHIBIT_W, EXHIBIT_H);
        }
    }

    // Paw icon when player is in range (falls back to eye if paw not loaded)
    const dist = Math.hypot(player.x - x, player.y - y);
    if (dist < EXHIBIT_DIST) {
        if (pawImage) {
            const pw = 20, ph = 20;
            gCtx.drawImage(pawImage, x - pw / 2, y - hh - ph - 4, pw, ph);
        } else {
            drawEyeIcon(x, y - hh - 10);
        }
    }
}

/**
 * Draw the catIce image centred on the ice cream counter.
 */
function drawIceCreamCat() {
    if (!iceCatImage) return;
    const room = ROOMS.find(r => r.id === 'iceCream');
    const imgW = Math.min(room.w - 16, 120);
    const imgH = imgW;
    const imgX = room.x + room.w / 2 - imgW / 2;
    const imgY = room.y + room.h / 2 - imgH / 2;
    gCtx.drawImage(iceCatImage, imgX, imgY, imgW, imgH);
}

/**
 * Draw the player.
 * If a sprite image is loaded for the current direction, draws that.
 * Otherwise falls back to the hand-drawn cat (placeholder until elephant sprites arrive).
 */
function drawPlayer() {
    const { x, y, dir } = player;
    const R = PLAYER_RADIUS;

    // ── Sprite path ──────────────────────────────────────────────────────────
    const sprite = playerSprites[dir];
    if (sprite) {
        const sw = R * 3.5;
        const sh = R * 3.5;
        gCtx.save();
        gCtx.shadowBlur = 10;
        gCtx.shadowColor = 'rgba(0,0,0,0.15)';
        gCtx.drawImage(sprite, x - sw / 2, y - sh / 2, sw, sh);
        gCtx.restore();
        return;
    }

    // ── Fallback: drawn cat ──────────────────────────────────────────────────

    gCtx.save();

    // Shadow
    gCtx.shadowBlur = 10;
    gCtx.shadowColor = 'rgba(0,0,0,0.15)';

    // Body
    gCtx.beginPath();
    gCtx.arc(x, y, R, 0, Math.PI * 2);
    gCtx.fillStyle = '#D4A574';
    gCtx.fill();
    gCtx.strokeStyle = '#8B5E3C';
    gCtx.lineWidth = 2;
    gCtx.stroke();

    gCtx.shadowBlur = 0;

    // Left ear (triangle)
    gCtx.beginPath();
    gCtx.moveTo(x - R * 0.45, y - R * 0.82);
    gCtx.lineTo(x - R * 0.82, y - R * 1.42);
    gCtx.lineTo(x - R * 0.08, y - R * 1.10);
    gCtx.closePath();
    gCtx.fillStyle = '#8B5E3C';
    gCtx.fill();

    // Right ear (triangle)
    gCtx.beginPath();
    gCtx.moveTo(x + R * 0.45, y - R * 0.82);
    gCtx.lineTo(x + R * 0.82, y - R * 1.42);
    gCtx.lineTo(x + R * 0.08, y - R * 1.10);
    gCtx.closePath();
    gCtx.fillStyle = '#8B5E3C';
    gCtx.fill();

    // Inner ear tint
    gCtx.beginPath();
    gCtx.moveTo(x - R * 0.42, y - R * 0.88);
    gCtx.lineTo(x - R * 0.72, y - R * 1.32);
    gCtx.lineTo(x - R * 0.14, y - R * 1.08);
    gCtx.closePath();
    gCtx.fillStyle = 'rgba(220,150,140,0.5)';
    gCtx.fill();
    gCtx.beginPath();
    gCtx.moveTo(x + R * 0.42, y - R * 0.88);
    gCtx.lineTo(x + R * 0.72, y - R * 1.32);
    gCtx.lineTo(x + R * 0.14, y - R * 1.08);
    gCtx.closePath();
    gCtx.fill();

    // Eyes
    gCtx.fillStyle = '#5A3825';
    gCtx.beginPath(); gCtx.arc(x - 8, y - 4, 3.5, 0, Math.PI * 2); gCtx.fill();
    gCtx.beginPath(); gCtx.arc(x + 8, y - 4, 3.5, 0, Math.PI * 2); gCtx.fill();
    // Eye shine
    gCtx.fillStyle = 'white';
    gCtx.beginPath(); gCtx.arc(x - 7, y - 5.5, 1.2, 0, Math.PI * 2); gCtx.fill();
    gCtx.beginPath(); gCtx.arc(x + 9, y - 5.5, 1.2, 0, Math.PI * 2); gCtx.fill();

    // Nose (small triangle)
    gCtx.fillStyle = '#D46060';
    gCtx.beginPath();
    gCtx.moveTo(x, y + 2);
    gCtx.lineTo(x - 3, y + 7);
    gCtx.lineTo(x + 3, y + 7);
    gCtx.closePath();
    gCtx.fill();

    gCtx.restore();
}

/**
 * Draw the on-canvas joystick (only shown when touch is detected).
 */
function drawJoystick() {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isMobile) return;

    const { baseX, baseY, stickX, stickY, BASE_R, STICK_R } = joystick;

    gCtx.save();

    // Base ring
    gCtx.globalAlpha = 0.35;
    gCtx.beginPath();
    gCtx.arc(baseX, baseY, BASE_R, 0, Math.PI * 2);
    gCtx.strokeStyle = '#444';
    gCtx.lineWidth = 3;
    gCtx.stroke();

    // Stick
    gCtx.globalAlpha = 0.6;
    gCtx.beginPath();
    gCtx.arc(stickX, stickY, STICK_R, 0, Math.PI * 2);
    gCtx.fillStyle = '#555';
    gCtx.fill();

    gCtx.restore();
}


// ============================================================
//  Touch Events — Joystick
// ============================================================

function onTouchStart(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        if (!joystick.active) {
            const tx = touch.clientX;
            const ty = touch.clientY;
            if (Math.hypot(tx - joystick.baseX, ty - joystick.baseY) < joystick.BASE_R * 2.5) {
                joystick.active = true;
                joystick.touchId = touch.identifier;
                joystick.stickX = tx;
                joystick.stickY = ty;
            }
        }
    }
}

function onTouchMove(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
        if (touch.identifier !== joystick.touchId) continue;
        const tx = touch.clientX;
        const ty = touch.clientY;
        const dx = tx - joystick.baseX;
        const dy = ty - joystick.baseY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > joystick.BASE_R) {
            joystick.stickX = joystick.baseX + dx * joystick.BASE_R / len;
            joystick.stickY = joystick.baseY + dy * joystick.BASE_R / len;
        } else {
            joystick.stickX = tx;
            joystick.stickY = ty;
        }
    }
}

function onTouchEnd(e) {
    for (const touch of e.changedTouches) {
        if (touch.identifier === joystick.touchId) {
            joystick.active = false;
            joystick.touchId = null;
            joystick.stickX = joystick.baseX;
            joystick.stickY = joystick.baseY;
        }
    }
}


// ============================================================
//  Exhibit Modal
// ============================================================

function openModal(exhibit) {
    if (exhibit.poem) {
        // Show dedicated poem page
        document.getElementById('poem-numeral').textContent = exhibit.label;
        document.getElementById('poem-body').textContent = exhibit.poem;
        document.getElementById('poem-modal').classList.add('visible');
    } else if (exhibit.imgSrc) {
        // Show full artwork image
        document.getElementById('artwork-title').textContent = exhibit.label;
        document.getElementById('artwork-img').src = exhibit.imgSrc;
        document.getElementById('artwork-modal').classList.add('visible');
    } else {
        document.getElementById('exhibit-modal-title').textContent = exhibit.label;
        document.getElementById('exhibit-modal-desc').textContent =
            exhibit.comingSoon
                ? 'This exhibit is being prepared with love. Check back soon! 🐾'
                : 'Description coming soon.';
        document.getElementById('exhibit-modal').classList.add('visible');
    }
}

function closeModal() {
    document.getElementById('exhibit-modal').classList.remove('visible');
    document.getElementById('poem-modal').classList.remove('visible');
    document.getElementById('artwork-modal').classList.remove('visible');
}


// ============================================================
//  Song Player — Audio + Vinyl Widget
// ============================================================

/**
 * Start playing a song. Stops any currently playing audio first.
 */
function playSong(song) {
    // Stop current audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(song.file);
    currentAudio.loop = false;
    currentAudio.volume = 0.7;

    currentSongIdx = collectedSongs.indexOf(song);

    // Auto-advance to next collected song when this one ends
    currentAudio.addEventListener('ended', () => {
        if (collectedSongs.length > 0) {
            const nextIdx = (currentSongIdx + 1) % collectedSongs.length;
            playSong(collectedSongs[nextIdx]);
        }
    });

    // Rebuild dropdown to show updated playing state
    currentAudio.addEventListener('playing', rebuildDropdown);

    currentAudio.play().catch(() => {
        // Autoplay may be blocked before user gesture — disk stays static
        // The user can click the vinyl to open dropdown and click a song to start
    });

    rebuildDropdown();
}

/**
 * Switch to a specific collected song (called from dropdown click).
 */
function switchToSong(song) {
    const isCurrentSong = currentSongIdx === collectedSongs.indexOf(song);
    if (isCurrentSong && currentAudio) {
        // Toggle pause / resume
        if (currentAudio.paused || currentAudio.ended) {
            currentAudio.play().catch(() => { });
        } else {
            currentAudio.pause();
        }
        rebuildDropdown();
    } else {
        playSong(song);
    }
}

/**
 * Rebuild the song dropdown items from current collected state.
 */
function rebuildDropdown() {
    const dropdownEl = document.getElementById('song-dropdown');
    if (!dropdownEl) return;

    dropdownEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const song = SONGS[i];
        const item = document.createElement('div');
        item.className = 'song-item';

        if (song.collected) {
            const isCurrentSong = currentSongIdx === collectedSongs.indexOf(song);
            const isPaused = isCurrentSong && currentAudio && currentAudio.paused;
            item.textContent = song.name;
            if (isCurrentSong) item.classList.add(isPaused ? 'paused' : 'playing');
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToSong(song);
            });
        } else {
            item.textContent = '???';
            item.classList.add('unknown');
        }

        dropdownEl.appendChild(item);
    }
}

/**
 * Initialize the vinyl player widget click behaviour.
 */
function initSongPlayer() {
    const vinylWrapper = document.getElementById('vinyl-wrapper');
    const dropdown = document.getElementById('song-dropdown');

    // Toggle dropdown on vinyl click
    vinylWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('visible');
        songDropdownOpen = dropdown.classList.contains('visible');
    });

    // Close dropdown when clicking anywhere else
    document.addEventListener('click', () => {
        dropdown.classList.remove('visible');
        songDropdownOpen = false;
    });

    // Populate initial empty state
    rebuildDropdown();
}


// ============================================================
//  HUD & Toast
// ============================================================

function showToast(text) {
    const el = document.getElementById('song-popup');
    el.textContent = text;
    el.style.display = 'block';
    // Restart animation by forcing reflow
    void el.offsetWidth;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    popupTimer = 2200;
}
