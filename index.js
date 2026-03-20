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
                if (input.value === "you have the best domain ever!") {
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
                if (input.value === "your works are amazing!") {
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
const OB = { left: 50, right: 1350, top: 170, bottom: 1080 };

// ---- Secret door: fixed center X (world coords) ----
const SECRET_DOOR_CX = 700;

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
        id: 'culinary', label: 'culinary', x: 160, y: 220, w: 470, h: 370,
        color: '#FFF3DC', opaqueColor: '#FFD366', doorSide: 'bottom', doorGapCx: 130 + 470 * 0.78, entered: false
    },
    {
        id: 'design', label: 'design room', x: 830, y: 220, w: 470, h: 370,
        color: '#EDFFF0', opaqueColor: '#5EFFA0', doorSide: 'bottom', doorGapCx: 800 + 470 * 0.22, entered: false
    },
    {
        id: 'illustration', label: 'illustration', x: 160, y: 710, w: 470, h: 370,
        color: '#FFEDF5', opaqueColor: '#FFB0D8', doorSide: 'top', doorGapCx: 130 + 470 * 0.78, entered: false
    },
    {
        id: 'poetry', label: 'poetry', x: 830, y: 710, w: 470, h: 370,
        color: '#F5EDFF', opaqueColor: '#CCA0FF', doorSide: 'top', doorGapCx: 800 + 470 * 0.22, entered: false
    },
];

// ---- Exhibit Definitions ----
// Placed ~30px inside room walls; y≈room.y+30 for top wall, x≈room.x+30 for left wall
const EXHIBITS = [
    // Culinary  (x: 160–630, y: 260–630) — top wall & left wall
    { id: 'c1', roomId: 'culinary', label: 'Banana Mage', x: 275, y: 295, imgSrc: 'rooms/culinary/BananaMage.png' },
    { id: 'c2', roomId: 'culinary', label: 'ChatGPT Dot', x: 385, y: 295, imgSrc: 'rooms/culinary/ChatGPTDot.png' },
    { id: 'c3', roomId: 'culinary', label: 'Hamiltonian Sandwich', x: 545, y: 295, imgSrc: 'rooms/culinary/Hamwich.png' },
    { id: 'c4', roomId: 'culinary', label: 'Hotdog Toothpaste', x: 195, y: 330, imgSrc: 'rooms/culinary/HotdogToothpaste.png' },
    { id: 'c5', roomId: 'culinary', label: 'Italy Pasta', x: 195, y: 470, imgSrc: 'rooms/culinary/ItalyPasta.png' },
    // Design    (x: 830–1300, y: 260–630) — top wall & right wall
    { id: 'd1', roomId: 'design', label: 'AGI Hoodie', x: 915, y: 295, imgSrc: 'rooms/design/AGIHoodie.jpg' },
    { id: 'd2', roomId: 'design', label: 'Foxtail Vase', x: 1035, y: 295, imgSrc: 'rooms/design/FoxtailVase.png' },
    { id: 'd3', roomId: 'design', label: 'The Continued Fraction of Phi', x: 1195, y: 295, imgSrc: 'rooms/design/GoldenRatio.png' },
    { id: 'd4', roomId: 'design', label: 'Son of Man Phone Case', x: 1235, y: 380, imgSrc: 'rooms/design/MagrittePhoneCase.png' },
    // Illustration (x: 130–600, y: 640–1010) — bottom wall
    { id: 'i1', roomId: 'illustration', label: 'Brief Spring', x: 195, y: 978, imgSrc: 'rooms/illustration/BriefSpring.png' },
    { id: 'i2', roomId: 'illustration', label: "I'm Bach", x: 295, y: 978, imgSrc: 'rooms/illustration/ImBach.GIF' },
    { id: 'i3', roomId: 'illustration', label: 'Neowsletter', x: 415, y: 978, imgSrc: 'rooms/illustration/Neowsletter.png' },
    { id: 'i4', roomId: 'illustration', label: 'Pieced Animals', x: 535, y: 978, imgSrc: 'rooms/illustration/PiecedAnimals.jpg' },
    // Poetry    (x: 800–1270, y: 640–1010) — bottom wall
    {
        id: 'p1', roomId: 'poetry', label: 'I', x: 875, y: 978, iceImgIdx: 0,
        poem: "Today I shall die.\nPlease with\nDandelions,\nWith dandelions fill,\nFill them please!\nDandelions,\nWithin\nMy grave.\nA soft bed\nLaden with\nSoft dreams."
    },
    {
        id: 'p2', roomId: 'poetry', label: 'II', x: 995, y: 978, iceImgIdx: 1,
        poem: "A face of clay.\nPinched, pulled, punched, pummeled-\nIs it but the toil of reform?\nHah!\nInborn in my body is\nA seed of ill omen.\n\nThe blaze of hope.\nScathed, scorched, singed, seared-\nHas it ushered in a pristine rebirth?\nNay!\nWhen the fruit breaks it's the life\nFlashing before one's eyes."
    },
    {
        id: 'p3', roomId: 'poetry', label: 'III', x: 1115, y: 978, iceImgIdx: 2,
        poem: "In the subway I sat on\nA seat between\nSeats.\nI leaned forward and saw the compartments\nA tunnel of\nPeople, their waves.\nNo one was talking so the\nSilence stretched my loneliness.\nBut I realized that\nLoneliness is everyone's\nOpen secret."
    },
    {
        id: 'p4', roomId: 'poetry', label: 'IV', x: 1235, y: 978, iceImgIdx: 3,
        poem: "Looking up at an osmanthus tree:\nYou must love me, or\nFluttering down those sweet\nKisses,\nWhy are they chasing me?"
    },
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
    { id: 's1', x: 365, y: 375, color: '#FFD215', collected: false, name: 'Minor Daisy Bell', file: 'music/minorDaisyBell.mp3', imgKey: 'daisy', roomId: 'culinary' },
    { id: 's2', x: 365, y: 825, color: '#FF4215', collected: false, name: 'Lighthouse By The Sea', file: 'music/lighthouseBytheSea.mp3', imgKey: 'sea', roomId: 'illustration' },
    { id: 's3', x: 1035, y: 375, color: '#157BFF', collected: false, name: 'A Space Odyssey', file: 'music/aSpaceOdyssey.mp3', imgKey: 'space', roomId: 'design' },
    { id: 's4', collected: false, name: 'Dark Whispers', file: 'music/darkWhispers.mp3' },
];

// ---- Tap tracking (for paw-icon inspect on mobile) ----
let tapTouchId = null;
let tapStartX = 0, tapStartY = 0;

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
    const sDoorL = SECRET_DOOR_CX - DOOR_GAP / 2;
    const sDoorR = SECRET_DOOR_CX + DOOR_GAP / 2;

    // Top wall — left segment
    wallRects.push({ x: OB.left, y: OB.top, w: sDoorL - OB.left, h: WALL_T });
    // Top wall — secret door segment (flagged so collision can be skipped when open)
    wallRects.push({ x: sDoorL, y: OB.top, w: DOOR_GAP, h: WALL_T, isSecretDoor: true });
    // Top wall — right segment
    wallRects.push({ x: sDoorR, y: OB.top, w: OB.right - sDoorR, h: WALL_T });

    wallRects.push({ x: OB.left, y: OB.bottom, w: OB.right - OB.left, h: WALL_T }); // bottom
    wallRects.push({ x: OB.left, y: OB.top, w: WALL_T, h: OB.bottom - OB.top }); // left
    wallRects.push({ x: OB.right, y: OB.top, w: WALL_T, h: OB.bottom - OB.top }); // right

    // --- Exhibit icons — impassable icons on room walls ---
    for (const ex of EXHIBITS) {
        if (ex.comingSoon) continue;
        wallRects.push({ x: ex.x - EXHIBIT_W / 2, y: ex.y - EXHIBIT_H / 2, w: EXHIBIT_W, h: EXHIBIT_H });
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
        // Play pending scene 3 audio on first keypress (trusted gesture context)
        if (s3PendingAudio) { playSong(s3PendingAudio); s3PendingAudio = null; }
    });
    window.addEventListener('keyup', e => { keys2[e.key] = false; });

    // Touch — joystick + tap inspect
    gameCanvas2.addEventListener('touchstart', onTouchStart, { passive: false });
    gameCanvas2.addEventListener('touchmove', onTouchMove, { passive: false });
    gameCanvas2.addEventListener('touchend', onTouchEnd, { passive: false });

    // PC mouse click — inspect spoon icon
    gameCanvas2.addEventListener('click', (e) => {
        const worldX = e.clientX + camX;
        const worldY = e.clientY + camY;
        const SPOON_HIT_R = 36;
        for (const ex of EXHIBITS) {
            const dPlayer = Math.hypot(player.x - ex.x, player.y - ex.y);
            if (dPlayer >= EXHIBIT_DIST) continue;
            const spoonCx = ex.x;
            const spoonCy = ex.y - EXHIBIT_H / 2 - 14;
            if (Math.hypot(worldX - spoonCx, worldY - spoonCy) < SPOON_HIT_R) {
                openModal(ex);
                break;
            }
        }
    });

    // Mouse move — track for scene 3 star attraction (stored globally)
    window.addEventListener('mousemove', (e) => { s3MouseX = e.clientX; s3MouseY = e.clientY; });

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
    if (!scene3Active) {
        update();
        render();
    }
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

    // --- Scene 3 trigger: step through the open secret door ---
    if (secretDoorOpen && player.y < OB.top && !scene3Active) {
        enterScene3();
        return;
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
        const bw = WORLD_W * 1.05, bh = WORLD_H * 1;
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
    // Ground is transparent — background image shows through
}

/**
 * Draw a single room.
 *
 * Solid rooms (ice cream counter): hatched fill + outline, no door, no label.
 * Regular rooms: opaque label overlay until entered, then lighter floor revealed.
 */
const ROOM_RADIUS = 20; // rounded corner radius for rooms and counter

/** Fill a rounded rectangle path (helper). */
function fillRoundRect(x, y, w, h, r) {
    gCtx.beginPath();
    gCtx.roundRect(x, y, w, h, r);
    gCtx.fill();
}

function drawRoom(room) {
    const { x, y, w, h, color } = room;

    // ── Ice cream counter (solid obstacle) ──────────────────────────────────
    if (room.solid) {
        gCtx.fillStyle = color;
        fillRoundRect(x, y, w, h, ROOM_RADIUS);
        return;
    }

    // ── Regular rooms ────────────────────────────────────────────────────────
    const doorSide = room.doorSide;
    const gapCx = room.doorGapCx !== undefined ? room.doorGapCx : x + w / 2;
    const gapL = gapCx - DOOR_GAP / 2;
    const gapR = gapCx + DOOR_GAP / 2;

    if (!room.entered) {
        // Opaque overlay: same hue, more saturated — rounded corners
        gCtx.fillStyle = room.opaqueColor || color;
        fillRoundRect(x, y, w, h, ROOM_RADIUS);

        // Label in white over the saturated fill
        gCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        gCtx.font = '600 24px Dream, sans-serif';
        gCtx.textAlign = 'center';
        gCtx.letterSpacing = '3px';
        gCtx.fillText(room.label, x + w / 2, y + h / 2 + 9);
        gCtx.letterSpacing = '0px';
    } else {
        // Entered: reveal floor in the room's light tint — rounded corners
        gCtx.fillStyle = color;
        fillRoundRect(x, y, w, h, ROOM_RADIUS);

        // Interior doormat at the entrance gap
        gCtx.fillStyle = 'rgba(190, 165, 140, 0.35)';
        if (doorSide === 'bottom') gCtx.fillRect(gapL, y + h - 4, DOOR_GAP, 14);
        else gCtx.fillRect(gapL, y - 10, DOOR_GAP, 14);
    }

    // Exterior doormat — always shown outside the entrance to indicate the gate
    gCtx.fillStyle = 'rgba(140, 135, 130, 0.28)';
    if (doorSide === 'bottom') {
        gCtx.fillRect(gapL, y + h + 2, DOOR_GAP, 12);
    } else {
        gCtx.fillRect(gapL, y - 14, DOOR_GAP, 12);
    }
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
    const sDCx = SECRET_DOOR_CX;
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
    gCtx.shadowBlur = 22;
    gCtx.shadowColor = '#FFD215';
    if (songImg && songImg.complete && songImg.naturalWidth > 0) {
        gCtx.drawImage(songImg, song.x - sz / 2, song.y - sz / 2, sz, sz);
    } else {
        // Fallback: plain ♪ with glow
        gCtx.fillStyle = '#FFD215';
        gCtx.font = `bold ${SONG_RADIUS}px sans-serif`;
        gCtx.textAlign = 'center';
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

    // Red spoon icon when player is in range
    const dist = Math.hypot(player.x - x, player.y - y);
    if (dist < EXHIBIT_DIST) {
        drawSpoonIcon(x, y - hh - 14);
    }
}

/**
 * Draw a small red DQ-style ice cream spoon with soft glow.
 * cx, cy = center of the icon in world space.
 */
function drawSpoonIcon(cx, cy) {
    gCtx.save();
    gCtx.translate(cx, cy);
    gCtx.rotate(-0.3); // slight tilt

    gCtx.shadowBlur = 12;
    gCtx.shadowColor = 'rgba(210, 30, 30, 0.65)';
    gCtx.fillStyle = '#D42020';
    gCtx.strokeStyle = '#D42020';
    gCtx.lineWidth = 2.2;
    gCtx.lineCap = 'round';

    // Bowl (ellipse at top)
    gCtx.beginPath();
    gCtx.ellipse(0, -9, 5, 7, 0, 0, Math.PI * 2);
    gCtx.fill();

    // Handle (line from bottom of bowl downward)
    gCtx.beginPath();
    gCtx.moveTo(0, -2);
    gCtx.lineTo(0, 13);
    gCtx.stroke();

    gCtx.restore();
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
        const tx = touch.clientX;
        const ty = touch.clientY;
        if (!joystick.active && Math.hypot(tx - joystick.baseX, ty - joystick.baseY) < joystick.BASE_R * 2.5) {
            joystick.active = true;
            joystick.touchId = touch.identifier;
            joystick.stickX = tx;
            joystick.stickY = ty;
        } else if (tapTouchId === null) {
            // Track as a potential tap for paw-icon inspect
            tapTouchId = touch.identifier;
            tapStartX = tx;
            tapStartY = ty;
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
        if (touch.identifier === tapTouchId) {
            tapTouchId = null;
            const moveDist = Math.hypot(touch.clientX - tapStartX, touch.clientY - tapStartY);
            if (moveDist < 18) {
                // Short tap — check if it lands on a paw icon (world-space hit)
                const worldX = touch.clientX + camX;
                const worldY = touch.clientY + camY;
                // Paw icon is drawn at (ex.x, ex.y - EXHIBIT_H/2 - ph/2 - 4) ≈ (ex.x, ex.y - 39)
                const PAW_HIT_R = 36;
                for (const ex of EXHIBITS) {
                    const dist = Math.hypot(player.x - ex.x, player.y - ex.y);
                    if (dist >= EXHIBIT_DIST) continue; // paw only visible when in range
                    const pawCx = ex.x;
                    const pawCy = ex.y - EXHIBIT_H / 2 - 14;
                    if (Math.hypot(worldX - pawCx, worldY - pawCy) < PAW_HIT_R) {
                        openModal(ex);
                        break;
                    }
                }
            }
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
    for (let i = 0; i < SONGS.length; i++) {
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


// ============================================================
//  Scene 3 — Star Field (with player)
// ============================================================

let scene3Active = false;
let s3Ctx = null;
let s3MouseX = -9999, s3MouseY = -9999;  // screen-space pointer position
let s3PointerDown = false;                     // true only while held / finger touching
let s3PendingAudio = null;                     // song to play on first gesture in scene 3

// ---- Sleeping cat NPC (scene 3, top-left) ----
const CAT_NPC_W = 240, CAT_NPC_H = 240, CAT_HIT_R = 110;
const CAT_LINES = [
    "Sleep is the best remedy\nfor the day. Let me sleep.",
    "Don't talk to me. You don't\nknow how tiring it is to be\nin charge of the freezer.",
    "Leave me alone, or I'll\nhaunt you at night!",
    "Zzz..."
];
let catDialogueIdx = 0;   // next line to show
let catBubbleLine  = -1;  // line currently displayed (-1 = hidden)
let catBubbleTimer = 0;   // frames remaining
const catNpcImg = new Image();
catNpcImg.src = 'images/catSleep.png';
const scene3Stars = [];

// Scene 3 boundary walls (same OB, but no bottom wall — walking off bottom returns)
const scene3WallRects = [
    { x: OB.left, y: OB.top, w: OB.right - OB.left, h: WALL_T }, // top
    { x: OB.left, y: OB.top, w: WALL_T, h: OB.bottom - OB.top }, // left
    { x: OB.right, y: OB.top, w: WALL_T, h: OB.bottom - OB.top }, // right
];

// ---- Rounded 5-pointed star ----

/**
 * Draw a soft 5-pointed star using midpoint quadratic bezier rounding.
 * All corners (inner and outer) are smoothed.
 */
function drawStar5Rounded(ctx, cx, cy, outerR, innerR) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const prev = pts[(i - 1 + 10) % 10];
        const curr = pts[i];
        const next = pts[(i + 1) % 10];
        const mx1 = (prev.x + curr.x) / 2, my1 = (prev.y + curr.y) / 2;
        const mx2 = (curr.x + next.x) / 2, my2 = (curr.y + next.y) / 2;
        if (i === 0) ctx.moveTo(mx1, my1); else ctx.lineTo(mx1, my1);
        ctx.quadraticCurveTo(curr.x, curr.y, mx2, my2);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

// ---- Star state ----

function initScene3Stars() {
    scene3Stars.length = 0;
    const pad = 60;
    for (let i = 0; i < 60; i++) {
        const outerR = 4 + Math.random() * 14;
        const hx = OB.left + pad + Math.random() * (OB.right - OB.left - pad * 2);
        const hy = OB.top + pad + Math.random() * (OB.bottom - OB.top - pad * 2);
        scene3Stars.push({
            x: hx, y: hy,
            homeX: hx, homeY: hy,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            outerR,
            innerR: outerR * 0.38,
            opacity: 0.5 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.018,
        });
    }
}

function updateScene3Stars() {
    // Convert screen-space pointer to world space for attraction
    const worldPX = s3MouseX + camX;
    const worldPY = s3MouseY + camY;
    const ATTRACT_R = 220, ATTRACT_F = 0.05, MAX_SPD = 3.5;
    const DAMP_FREE = 0.95, DAMP_ATTRACT = 0.97;
    const SPRING_K = 0.008;

    for (const s of scene3Stars) {
        if (s3PointerDown) {
            // Gentle brownian drift while attracted
            s.vx += (Math.random() - 0.5) * 0.04;
            s.vy += (Math.random() - 0.5) * 0.04;

            // Attraction force
            const dx = worldPX - s.x, dy = worldPY - s.y;
            const d = Math.hypot(dx, dy);
            if (d > 0 && d < ATTRACT_R) {
                const f = ATTRACT_F * (1 - d / ATTRACT_R);
                s.vx += (dx / d) * f;
                s.vy += (dy / d) * f;
            }

            s.vx *= DAMP_ATTRACT; s.vy *= DAMP_ATTRACT;
        } else {
            // Spring pull back to home position
            s.vx += (s.homeX - s.x) * SPRING_K;
            s.vy += (s.homeY - s.y) * SPRING_K;
            // Very slight brownian so it doesn't look frozen
            s.vx += (Math.random() - 0.5) * 0.008;
            s.vy += (Math.random() - 0.5) * 0.008;

            s.vx *= DAMP_FREE; s.vy *= DAMP_FREE;
        }

        // Clamp speed
        const spd = Math.hypot(s.vx, s.vy);
        if (spd > MAX_SPD) { s.vx = s.vx / spd * MAX_SPD; s.vy = s.vy / spd * MAX_SPD; }

        s.x += s.vx; s.y += s.vy;

        // Rotation always ticks
        s.rotation += s.rotationSpeed;

        // Wrap within world bounds (only when attracted — springs handle free mode)
        if (s3PointerDown) {
            if (s.x < OB.left - s.outerR) s.x = OB.right + s.outerR;
            if (s.x > OB.right + s.outerR) s.x = OB.left - s.outerR;
            if (s.y < OB.top - s.outerR) s.y = OB.bottom + s.outerR;
            if (s.y > OB.bottom + s.outerR) s.y = OB.top - s.outerR;
        }
    }
}

// ---- Player movement inside scene 3 ----

function updateScene3Movement() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let dx = 0, dy = 0;

    if (keys2['ArrowLeft'] || keys2['a'] || keys2['A']) dx -= 1;
    if (keys2['ArrowRight'] || keys2['d'] || keys2['D']) dx += 1;
    if (keys2['ArrowUp'] || keys2['w'] || keys2['W']) dy -= 1;
    if (keys2['ArrowDown'] || keys2['s'] || keys2['S']) dy += 1;

    if (joystick.active) {
        const jdx = joystick.stickX - joystick.baseX;
        const jdy = joystick.stickY - joystick.baseY;
        const jLen = Math.hypot(jdx, jdy);
        if (jLen > 8) { dx += jdx / joystick.BASE_R; dy += jdy / joystick.BASE_R; }
    }

    const len = Math.hypot(dx, dy);
    if (len > 0) {
        dx = (dx / len) * PLAYER_SPEED;
        dy = (dy / len) * PLAYER_SPEED;
        if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? 'right' : 'left';
        else player.dir = dy > 0 ? 'down' : 'up';
    }

    // Resolve against scene3 walls (swap wallRects temporarily)
    const savedWalls = wallRects;
    wallRects = scene3WallRects;
    const { x: rx, y: ry } = resolveMove(player.x + dx, player.y + dy);
    wallRects = savedWalls;
    player.x = rx; player.y = ry;

    // Return to scene 2 when player walks off the bottom
    if (player.y > OB.bottom + PLAYER_RADIUS) { exitScene3(); return; }

    // Camera
    camX = Math.max(0, Math.min(player.x - vw / 2, WORLD_W - vw));
    camY = Math.max(0, Math.min(player.y - vh / 2, WORLD_H - vh));
}

// ---- Cat NPC ----

function drawCatNPC() {
    const cx = OB.left + 160, cy = OB.top + 210;
    // Cat image
    if (catNpcImg.complete && catNpcImg.naturalWidth > 0) {
        gCtx.drawImage(catNpcImg, cx - CAT_NPC_W / 2, cy - CAT_NPC_H / 2, CAT_NPC_W, CAT_NPC_H);
    }
    // Speech bubble
    if (catBubbleTimer > 0 && catBubbleLine >= 0) {
        catBubbleTimer--;
        const lines = CAT_LINES[catBubbleLine].split('\n');
        const fSize = 13;
        gCtx.font = `${fSize}px Arial, Helvetica, sans-serif`;
        const lineH = fSize + 5;
        const maxW = lines.reduce((m, l) => Math.max(m, gCtx.measureText(l).width), 0);
        const padX = 12, padY = 9;
        const bw = maxW + padX * 2;
        const bh = lines.length * lineH + padY * 2;
        const bx = cx - bw / 2;
        const by = cy - CAT_NPC_H / 2 - bh - 14;
        // Bubble background
        gCtx.save();
        gCtx.fillStyle = 'rgba(255,255,255,0.93)';
        gCtx.strokeStyle = 'rgba(180,180,180,0.7)';
        gCtx.lineWidth = 1.2;
        gCtx.beginPath();
        gCtx.roundRect(bx, by, bw, bh, 8);
        gCtx.fill(); gCtx.stroke();
        // Tail triangle pointing down toward cat
        gCtx.beginPath();
        gCtx.moveTo(cx - 7, by + bh);
        gCtx.lineTo(cx + 7, by + bh);
        gCtx.lineTo(cx, by + bh + 12);
        gCtx.closePath();
        gCtx.fillStyle = 'rgba(255,255,255,0.93)';
        gCtx.fill();
        // Text
        gCtx.fillStyle = '#222';
        gCtx.textAlign = 'center';
        gCtx.textBaseline = 'top';
        lines.forEach((l, i) => gCtx.fillText(l, cx, by + padY + i * lineH));
        gCtx.restore();
    }
}

function tappedCat(screenX, screenY) {
    const wx = screenX + camX, wy = screenY + camY;
    const cx = OB.left + 160, cy = OB.top + 210;
    if (Math.hypot(wx - cx, wy - cy) > CAT_HIT_R) return;
    catBubbleLine  = catDialogueIdx;
    catDialogueIdx = (catDialogueIdx + 1) % CAT_LINES.length;
    catBubbleTimer = 320; // ~5 s at 60 fps
}

// ---- Render ----

function renderScene3() {
    const canvas = document.getElementById('scene3-canvas');
    const vw = window.innerWidth, vh = window.innerHeight;
    const RETURN_BAR_H = 52;

    if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw; canvas.height = vh;
    }

    // Temporarily route all draw calls through s3Ctx
    const prevCtx = gCtx;
    gCtx = s3Ctx;

    // Black background (screen space)
    gCtx.fillStyle = '#000';
    gCtx.fillRect(0, 0, vw, vh);

    // Camera transform — world space drawing below
    gCtx.save();
    gCtx.translate(-camX, -camY);

    // Stars
    for (const s of scene3Stars) {
        gCtx.save();
        gCtx.globalAlpha = s.opacity;
        gCtx.shadowBlur = 6;
        gCtx.shadowColor = 'rgba(255,255,255,0.6)';
        gCtx.translate(s.x, s.y);
        gCtx.rotate(s.rotation);
        drawStar5Rounded(gCtx, 0, 0, s.outerR, s.innerR);
        gCtx.restore();
    }

    // Sleeping cat NPC
    drawCatNPC();

    // Player (reuses scene 2 drawPlayer which uses gCtx)
    drawPlayer();

    gCtx.restore(); // end camera transform

    // Return bar (screen space overlay)
    const barY = vh - RETURN_BAR_H;
    gCtx.fillStyle = 'rgba(90, 90, 90, 0.88)';
    gCtx.fillRect(0, barY, vw, RETURN_BAR_H);
    gCtx.fillStyle = 'rgba(210, 210, 210, 0.9)';
    gCtx.font = '15px Arial, Helvetica, sans-serif';
    gCtx.textAlign = 'center';
    gCtx.textBaseline = 'middle';
    gCtx.fillText('← return to gallery', vw / 2, barY + RETURN_BAR_H / 2);
    gCtx.textBaseline = 'alphabetic';

    // Restore context
    gCtx = prevCtx;
}

const _vinylDisk = () => document.getElementById('vinyl-disk'); // cached lazily
let _vinylDiskEl = null;

function scene3Loop() {
    if (!scene3Active) return;
    updateScene3Movement();
    updateScene3Stars();
    renderScene3();
    // Keep vinyl spinning in sync while scene 2 update() is paused
    if (!_vinylDiskEl) _vinylDiskEl = _vinylDisk();
    if (_vinylDiskEl) {
        const isPlaying = currentAudio && !currentAudio.paused && !currentAudio.ended;
        _vinylDiskEl.classList.toggle('spinning', !!isPlaying);
    }
    requestAnimationFrame(scene3Loop);
}

// ---- Scene 3 input ----

function onScene3Click(e) {
    if (e.clientY > window.innerHeight - 52) { exitScene3(); return; }
    tappedCat(e.clientX, e.clientY);
}

// Unified touch handler — feeds joystick AND tracks pointer for star attraction
function onScene3TouchAll(e) {
    e.preventDefault();
    onTouchStart(e); // delegate to joystick system
    if (s3PendingAudio) { playSong(s3PendingAudio); s3PendingAudio = null; }
    for (const t of e.changedTouches) {
        if (t.identifier !== joystick.touchId) {
            // Non-joystick touch = star attraction finger
            s3MouseX = t.clientX; s3MouseY = t.clientY;
            s3PointerDown = true;
        }
        if (t.clientY > window.innerHeight - 52) { exitScene3(); return; }
    }
}

function onScene3TouchMoveAll(e) {
    e.preventDefault();
    onTouchMove(e);
    for (const t of e.changedTouches) {
        if (t.identifier !== joystick.touchId) {
            s3MouseX = t.clientX; s3MouseY = t.clientY;
        }
    }
}

function onScene3TouchEndAll(e) {
    onTouchEnd(e);
    if (e.touches.length === 0 || (e.touches.length === 1 && joystick.active)) {
        s3PointerDown = false;
    }
    // Check cat tap for each lifted finger
    for (const t of e.changedTouches) {
        tappedCat(t.clientX, t.clientY);
    }
}

function onScene3MouseDown(e) {
    s3PointerDown = true; s3MouseX = e.clientX; s3MouseY = e.clientY;
    if (s3PendingAudio) { playSong(s3PendingAudio); s3PendingAudio = null; }
}
function onScene3MouseUp() { s3PointerDown = false; }

// ---- Transitions ----

function enterScene3() {
    scene3Active = true;

    gameCanvas2.style.display = 'none';
    document.getElementById('interact-hint').style.display = 'none';

    const s3 = document.getElementById('scene3-canvas');
    s3.style.display = 'block';
    s3Ctx = s3.getContext('2d');

    if (scene3Stars.length === 0) initScene3Stars();

    // Place player just inside the bottom of scene 3 world
    player.x = WORLD_W / 2;
    player.y = OB.bottom - PLAYER_RADIUS - 30;
    player.dir = 'up';

    // Unlock Dark Whispers on first entry — reveals it in the dropdown
    const darkWhispers = SONGS.find(s => s.id === 's4');
    if (darkWhispers && !collectedSongs.includes(darkWhispers)) {
        darkWhispers.collected = true;
        collectedSongs.push(darkWhispers);
    }
    // Don't call playSong here — we're inside requestAnimationFrame, not a user gesture,
    // so browsers will block autoplay. Instead flag it; the keydown/mousedown/touch
    // handlers below will call playSong on the very first interaction in scene 3.
    if (darkWhispers) s3PendingAudio = darkWhispers;

    s3.addEventListener('touchstart', onScene3TouchAll, { passive: false });
    s3.addEventListener('touchmove', onScene3TouchMoveAll, { passive: false });
    s3.addEventListener('touchend', onScene3TouchEndAll, { passive: false });
    s3.addEventListener('mousedown', onScene3MouseDown);
    s3.addEventListener('click', onScene3Click);
    window.addEventListener('mouseup', onScene3MouseUp);

    requestAnimationFrame(scene3Loop);
}

function exitScene3() {
    scene3Active = false;
    s3PointerDown = false;

    const s3 = document.getElementById('scene3-canvas');
    s3.style.display = 'none';
    s3.removeEventListener('touchstart', onScene3TouchAll);
    s3.removeEventListener('touchmove', onScene3TouchMoveAll);
    s3.removeEventListener('touchend', onScene3TouchEndAll);
    s3.removeEventListener('mousedown', onScene3MouseDown);
    s3.removeEventListener('click', onScene3Click);
    window.removeEventListener('mouseup', onScene3MouseUp);

    gameCanvas2.style.display = 'block';

    // Place player just inside the top of scene 2 (below the secret door)
    player.x = WORLD_W / 2;
    player.y = OB.top + PLAYER_RADIUS + 28;
    player.dir = 'down';

    s3MouseX = -9999; s3MouseY = -9999;
}
