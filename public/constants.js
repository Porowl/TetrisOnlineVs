const canvas = document.getElementById("field");
const canvas2 = document.getElementById("infos");
const canvas3 = document.getElementById("animation");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const ctx3 = canvas3.getContext("2d");

const settings = [
    0,  // 0: GAME MODE
    0   // 1: Player Num (+1 when loaded);
];

const NEXT = "NEXT";
const HOLD = "HOLD";
const LEVEL = "LEVEL";
const REMAINING = "LINES REMAINING:"
const DEATH_MESSAGE = i => `Player ${i+1} topped out.`;

const GAMEMODE_NAMES = Object.freeze(
{
    0: "NORMAL",
    1: "VARIABLE",
    2: "VERSUS"
});


const BOARD_HEIGHT  = 40;
const BOARD_WIDTH   = 10;

const VISIBLE_HEIGHT = 20;

const BLOCK_SIZE = 20;
const NEXT_BLOCK_SIZE = 10;
const HOLD_BLOCK_SIZE = 15;

const BLOCK_SIZE_OUTLINE = BLOCK_SIZE;
const NEXT_BLOCK_SIZE_OUTLINE = NEXT_BLOCK_SIZE+1;
const HOLD_BLOCK_SIZE_OUTLINE = HOLD_BLOCK_SIZE+1;

const X_OFFSET = 160;
const Y_OFFSET = 40;

const BOARD_CENTER_X = X_OFFSET + BLOCK_SIZE_OUTLINE*5;
const BOARD_CENTER_Y = Y_OFFSET + BLOCK_SIZE_OUTLINE*10;
const BOARD_END_Y = Y_OFFSET + BLOCK_SIZE_OUTLINE*20;

const NEXT_X_OFFSET = X_OFFSET 
                    + BLOCK_SIZE_OUTLINE*BOARD_WIDTH
                    + 30;
const NEXT_Y_OFFSET = Y_OFFSET;
const DIST_BTW_NEXTS = 3*NEXT_BLOCK_SIZE_OUTLINE;

const HOLD_X_OFFSET = X_OFFSET - 126;
const HOLD_Y_OFFSET = Y_OFFSET;

const PLAYER_OFFSET = 500;

const LINE_CLEAR_FRAMES = 20;
const LOCK_ANIMATION_FRAMES = 15;
const HARDDROP_ANIMATION_FRAMES = 2;

const KEY = {
	SHIFT:  16,     //hold
	CTRL:   17,     //rotate counterclockwise
	SPACE:  32,     //harddrop
	LEFT:   37,
	UP:     38,     //rotate clockwise
	RIGHT:  39,
	DOWN:   40,     //softdrop
	C:      67,     //hold
	X:      88,     //rotate clockwise
	Z:      90,      //rotate counterclockwise
    G:      78,     //Toggle Ghost
    //P:      80,     //Pause
};


const DRAWMODE = Object.freeze(
{
    DRAWPIECE: 0,
    HIDEPIECE: 1,
    DRAWGHOST: 2,
    HIDEGHOST: 3
});

const PIECE_MAP = Object.freeze(
[
    [ 0x6C00, 0x4620, 0x06C0, 0x8C40 ], // 'S' 
    [ 0xC600, 0x2640, 0x0C60, 0x4C80 ], // 'Z' 
    [ 0x4E00, 0x4640, 0x0E40, 0x4C40 ], // 'T' 
    [ 0x2E00, 0x4460, 0xE800, 0xC440 ], // 'L' 
    [ 0x8E00, 0x6440, 0xE200, 0x44C0 ], // 'J' 
    [ 0x0F00, 0x2222, 0x00F0, 0x4444 ], // 'I' 
    [ 0x6600, 0x6600, 0x6600, 0x6600 ]  // 'O'
]);

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~COLORS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
const COLOR_BLACK =         "rgb(000,000,000)";
const COLOR_GREY =          "rgb(040,040,040)";
const COLOR_WHITE =         "rgb(255,255,255)";
const COLOR_GHOST =         "rgb(080,080,080)";
const LINE_CLEAR_WHITE =    "rgba(255,255,255,0.15)";
const LINE_CLEAR_BLACK =    "rgba(000,000,000,0.15)";
const PIECE_3D_ADD = "rgba(0,0,0,0.3)";

const LOCK_WHITE = "rgba(255,255,255,0.07)";

const COLOR_MAP =  Object.freeze(
[
    "rgba(114,203,059,1.0)",     //S
    "rgba(255,050,019,1.0)",     //Z
    "rgba(160,000,241,1.0)",     //T
    "rgba(255,151,028,1.0)",     //L
    "rgba(003,065,174,1.0)",     //J
    "rgba(000,224,187,1.0)",     //I
    "rgba(255,213,000,1.0)",     //O
    "rgba(200,200,200,1.0)"      //GARBAGE
]);

const GHOST_COLOR_MAP = Object.freeze(
[
    "rgba(000,240,000,0.5)",     //S
    "rgba(240,000,000,0.5)",     //Z
    "rgba(160,000,241,0.5)",     //T
    "rgba(239,160,000,0.5)",     //L
    "rgba(000,000,240,0.75)",    //J
    "rgba(000,224,187,0.5)",     //I
    "rgba(240,240,000,0.5)"      //O
]);

const P1_COLORS = Object.freeze(
    [
        "rgb(000,161,224)",
        "rgb(004,107,148)"
    ]
);
const P2_COLORS = Object.freeze(
    [
        "rgb(225,154,046)",
        "rgb(181,112,038)"
    ]
);