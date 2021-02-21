const {io, ee} = require('../../server.js');

class View {
	constructor(player,enemy) {
		this.player = player;
		this.enemy = enemy;
	}

	draw = table => {
		io.to(this.player).emit('draw', table);
		io.to(this.enemy).emit('edraw', table);
	};

	drawPiece = (piece, MODE, index = 0) => {
		io.to(this.player).emit('drawPiece', {
			piece, MODE, index
		});
		io.to(this.enemy).emit('edrawPiece', {
			piece, MODE, index
		});
	};

	drawNext = (typeId, index) => {
		io.to(this.player).emit('drawNext', {
			typeId, index
		});
		io.to(this.enemy).emit('edrawNext', {
			typeId, index
		});
	};

	refreshNexts = () => {
		io.to(this.player).emit('refreshNexts');
		io.to(this.enemy).emit('erefreshNexts');
	};

	drawHold = (typeId = -1, mode) => {
		io.to(this.player).emit('drawHold', {
			typeId, mode
		});
		io.to(this.enemy).emit('edrawHold', {
			typeId, mode
		});
	};

	refreshHold = () => {
		io.to(this.player).emit('refreshHold');
		io.to(this.enemy).emit('erefreshHold');
	};

	clearAnimation = (l, i) => {
		io.to(this.player).emit('clearAnimation', {
			l, i
		});
		io.to(this.enemy).emit('eclearAnimation', {
			l, i
		});
	};

	/* UI GRAPHICS*/

	countDown = i => {
		io.to(this.player).emit('countDown', i);
		io.to(this.enemy).emit('ecountDown', i);
	};

	displayScore = score => {
		io.to(this.player).emit('displayScore', score);
		io.to(this.enemy).emit('edisplayScore', score);
	};

	levelProgress = (lines, level, goal) => {
		io.to(this.player).emit('levelProgress', {
			lines, level, goal
		});
	};

	displayScoreArr = scoreArr => {
		io.to(this.player).emit('displayScoreArr', scoreArr);
		io.to(this.enemy).emit('edisplayScoreArr', scoreArr);
	};

	lockAnimation = (piece, frame = 0, offset = 0) => {
		io.to(this.player).emit('lockAnimation', {
			piece, frame, offset
		});
		io.to(this.enemy).emit('elockAnimation', {
			piece, frame, offset
		});
	};

	hardDropAnimation = (tarPiece, offset = 0) => {
		io.to(this.player).emit('hardDropAnimation', {
			tarPiece, offset
		});
		io.to(this.enemy).emit('ehardDropAnimation', {
			tarPiece, offset
		});
	};

	showGarbage = n => {
		io.to(this.player).emit('showGarbage', n);
		io.to(this.enemy).emit('eshowGarbage', n);
	};
}

module.exports = View;