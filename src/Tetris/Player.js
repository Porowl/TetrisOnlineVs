const Board = require('./Board.js');
const View = require('./View.js');
const Storage = require('./Storage.js');
const Piece = require('./Piece.js');

const {io, ee} = require('../../server.js');

const {DRAWMODE,MOVES,KEYSTATES,LAST_MOVE,KEY,ENTRY_DELAY,DAS,ARR,OFFSETS,I_OFFSETS,PIECE_MAP,
	   LINE_CLEAR_FRAMES,CLEAR_STRINGS
	  } = require('./constants.js');

class Player {
	constructor(id, enemy, random) {
		this.user = id.id;
		this.enemy = enemy.id;
		this.board = new Board();
		this.view = new View(id.id,enemy.id);
		this.stg = new Storage(id.id,enemy.id);
		this.random = random;
		this.gravity = this.stg.getGravity();
		this.piece = {};
		
		this.clearedLineArr = {};
		
		this.ghostSwitch = true;
		this.holdUsed = false;
		this.pieceHeld = false;
		
		this.initDelay = 0;
		this.lineClearDelay = -1;
		
		this.LRFrameCounter = 0;
		this.RotateFrameCounter = 0;
		this.dropRate = 0;
		
		this.phase = PHASE.NEW_BLOCK;
		this.gameOver = false;
		this.cycle = undefined;
		
		id.on('keydown', (keyCode) => {
			this.stg.keyMap[keyCode] = true;
		});
		id.on('keyup', (keyCode) => {
			switch(keyCode) {
				case 16:
				case 32:
				case 67:
					break;
				default:
					delete this.stg.keyMap[keyCode];
					break;
			}
		});
		
		let eventName = 'garbCountP'+this.user 
		ee.on(eventName,data=>{
			let lines = this.board.deductGarbage(data)
            this.view.showGarbage(this.board.garbage); 
			if(lines>0) {
				let eventName = 'attackOnP' + this.enemy;
				ee.emit(eventName,lines)
				console.log(`Sending ${lines} lines to board ${this.enemy}`)
			}
		})
		
		eventName = 'attackOnP' + this.user
		ee.on(`attackOnP${this.user}`,data=>
        {
            this.board.addGarbage(data);
            this.view.showGarbage(this.board.garbage); 
        });
	}

	countDown = () => {
		setTimeout(() => {
			this.view.countDown(3);
		}, 0);
		setTimeout(() => {
			this.view.countDown(2);
		}, 1000);
		setTimeout(() => {
			this.view.countDown(1);
		}, 2000);
		setTimeout(() => {
			this.view.countDown(0);
			this.gameStart();
		}, 3000);
	};

	gameStart = () => {
		this.piece = new Piece(this.random.getPiece(this.stg.getIndexInc()));
		this.updatePiece(this.piece);
		this.updateNexts();
		this.updateScore();
	};

	update = (dt) => {
		switch (this.phase) {
			case PHASE.CLEAR_UPS: {
				this.board.executeGarbage();
				this.view.showGarbage(this.board.garbage); 
				let scoreArr = this.stg.updateLines(this.clearedLineArr, this.board.isEmpty());
				this.view.displayScoreArr(scoreArr);
				this.updateScore();
				
				this.phase = PHASE.NEW_BLOCK;
				break;
			}
				
			case PHASE.NEW_BLOCK: {
				this.view.draw(this.board.field);
				this.getNewPiece();
				//this.checkTopOut();
				
				this.phase = PHASE.FALL;
				break;
			}
				
			case PHASE.FALL: {
				this.moveDownCycle(dt);
				this.inputCycle();
				if (!this.board.canMoveDown(this.piece)) {
					this.lockDelay += dt;
				} else {
					this.lockDelay = 0;
				}

				if (
					(this.piece.hardDropped || this.lockDelay > 0.5) &&
					!this.board.canMoveDown(this.piece)
				) {
					this.phase = PHASE.LOCK;
				}
				break;
			}
				
			case PHASE.LOCK: {
				this.lock(this.piece);
				
				this.phase = PHASE.CLEAR_ANI;
				break;
			}
				
			case PHASE.CLEAR_ANI: {
				if (this.lineClearDelay > 0) {
					this.lineClearDelay--;
					for (var i = 0; i < this.clearedLineArr.length(); i++)
						this.view.clearAnimation(this.clearedLineArr.get(i), this.lineClearDelay);
				} else {
					this.phase = PHASE.CLEAR;
				}
				break;
			}
				
			case PHASE.CLEAR: {
				for (var i = 0; i < this.clearedLineArr.length(); i++) {
					this.board.clearLine(this.clearedLineArr.get(i));
				}
				
				this.phase = PHASE.CLEAR_UPS;
			}
		}
	};

	getNewPiece = () => {
		this.piece = new Piece(this.random.getPiece(this.stg.getIndexInc()));
		this.view.drawHold(this.stg.hold, DRAWMODE.DRAWPIECE);
		this.updatePiece(this.piece);
		this.updateNexts();
		this.gravity = this.stg.getGravity();
		this.holdUsed = false;
		this.dropRate = - ENTRY_DELAY * 0.016;
	};

	inputCycle = () => {
		this.moveLR();
		this.rotate();
		this.hold();
		this.hardDrop();
	};

	moveDownCycle = (dt) => {
		if (this.stg.keyMap[KEY.DOWN] && this.gravity > 2 / 60) {
			if (this.moveDown()) {
				this.stg.addDropScore(1);
				this.updateScore();
			}
			return;
		}
		this.dropRate += dt;
		while (this.dropRate > this.gravity) {
			this.dropRate -= this.gravity;
			this.moveDown();
		}
	};

	moveDown = () => {
		if (this.board.canMoveDown(this.piece)) {
			let p = MOVES[KEY.DOWN](this.piece);
			this.updatePiece(p);
			return true;
		}
		return false;
	};

	moveLR = () => {
		let p;
		let state = this.stg.checkLR();

		if (state == KEYSTATES.LR || state == -1) {
			this.LRFrameCounter = 0;
		} else {
			if (this.LRFrameCounter == 0) {
				let key =
					state == KEYSTATES.L
						? KEY.LEFT
						: KEY.RIGHT;
				p = MOVES[key](this.piece);
			} else if (this.LRFrameCounter >= DAS) {
				if ((this.LRFrameCounter - DAS) % ARR == 0) {
					let key =
						state == KEYSTATES.L
							? KEY.LEFT
							: KEY.RIGHT;
					p = MOVES[key](this.piece);
				}
			}
			this.LRFrameCounter++;
		}

		if (p) {
			if (this.board.valid(p)) {
				this.updatePiece(p);
			}
		}
	};

	rotate = () => {
		let state = this.stg.checkRot();
		if (state == KEYSTATES.UZ || state == -1) {
			this.RotateFrameCounter = 0;
		} else {
			if (this.RotateFrameCounter == 0) {
				state == KEYSTATES.U ? this.rotateAc(0) : this.rotateAc(1);
			}
			this.RotateFrameCounter++;
		}
	};

	rotateAc = (mode) => {
		const piece = this.piece;
		let p;
		let test = 0;
		let next = mode == 0 ? (this.piece.rotation + 1) % 4 : this.piece.rotation - 1;

		if (next < 0) next += 4;
		do {
			p = {
				...piece,
				x:
					piece.x +
					(piece.typeId == 5 ? I_OFFSETS : OFFSETS)[piece.rotation + mode * 4][test][0],
				y:
					piece.y -
					(piece.typeId == 5 ? I_OFFSETS : OFFSETS)[piece.rotation + mode * 4][test][1],
				rotation: next,
				shape: PIECE_MAP[piece.typeId][next],
				lastMove: LAST_MOVE.SPIN,
				rotTest: test,
			};
			test++;
		} while (!this.board.valid(p) && test < 5);

		if (p) if (this.board.valid(p)) this.updatePiece(p);
	};

	hold = () => {
		const piece = this.piece;
		if (!this.stg.checkHold()) return;
		if (!this.holdUsed) {
			if (!this.pieceHeld) {
				this.pieceHeld = true;
				this.stg.hold = piece.typeId;
				this.view.drawPiece(piece, DRAWMODE.HIDEPIECE);
				this.view.drawPiece(piece, DRAWMODE.HIDEGHOST, this.board.getGhostIndex(piece));
				this.getNewPiece();
			} else {
				var temp = this.stg.hold;
				var a = piece.typeId;
				this.view.drawHold(a, DRAWMODE.DRAWGHOST);
				this.stg.hold = a;
				var p = new Piece(temp);
				this.updatePiece(p);
				this.piece = p;
			}
			this.holdUsed = true;
		}
		this.stg.keyMap[KEY.SHIFT] = false;
		this.stg.keyMap[KEY.C] = false;
	};

	hardDrop = () => {
		if (this.stg.keyMap[KEY.SPACE]) {
			var result = this.board.hardDrop(this.piece);
			this.view.hardDropAnimation(result.piece, this.board.garbage);
			this.updatePiece(result.piece);
			this.stg.addDropScore(result.score * 2);
			this.piece.hardDropped = true;
			this.stg.keyMap[KEY.SPACE] = false;
			this.stg.keyMap[KEY.H] = false;
		}
	};

	updatePiece = (p) => {
		let piece = this.piece;

		if (this.ghostSwitch)
			this.view.drawPiece(piece, DRAWMODE.HIDEGHOST, this.board.getGhostIndex(piece));
		this.view.drawPiece(piece, DRAWMODE.HIDEPIECE);

		this.piece.move(p);

		if (this.ghostSwitch)
			this.view.drawPiece(p, DRAWMODE.DRAWGHOST, this.board.getGhostIndex(p));
		this.view.drawPiece(piece, DRAWMODE.DRAWPIECE);
	};

	lock = (piece) => {
		this.lockDelay = 0;
		this.dropRate = 0;
		this.clearedLineArr = this.board.lock(piece);
		this.lineClearDelay = this.clearedLineArr.length() == 0 ? 0 : LINE_CLEAR_FRAMES;
		this.view.lockAnimation(piece, 0, this.board.garbage);
	};

	updateNexts = () => {
		this.view.refreshNexts();
		let arr = this.random.nextPieces(this.stg.getIndex());
		for (var i = 0; i < Math.max(this.stg.nexts, 6); i++) {
			this.view.drawNext(arr[i], i);
		}
	};

	updateScore = () => {
		this.view.displayScore(this.stg.scoreToText());
	};
}

const PHASE = {
	STANDBY: -1,
	CLEAR_UPS: 0,
	NEW_BLOCK: 1,
	FALL: 2,
	LOCK: 3,
	CLEAR_ANI: 4,
	CLEAR: 5,
};

module.exports = Player;