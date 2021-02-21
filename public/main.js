var socket = io();
var requestId;
var keySettings = () => {};
var View;
var EnemyView;

const init = () => {
	resize();

	window.addEventListener('resize', resize, false);

	socket.on('connected', () => {
		document.fonts.ready.then(() => {
			View = new view(0);
			EnemyView = new view(1);

			setEvents();
			socket.emit('waiting');
		});
	});

	document.addEventListener('keydown', (event) => {
		socket.emit('keydown', event.keyCode);
	});
	document.addEventListener('keyup', (event) => {
		socket.emit('keyup', event.keyCode);
	});
};

const gameStart = () => {
	document.getElementById('main').hidden = true;
};

const resize = () => {
	var ratio = canvas.width / canvas.height;
	var ch = window.innerHeight;
	var cw = ch * ratio;
	if (cw > window.innerWidth) {
		cw = Math.floor(window.innerWidth);
		ch = Math.floor(cw / ratio);
	}
	if (window.innerWidth > 1024) {
		cw = 1024;
		ch = 768;
	}
	canvas.style.width = cw;
	canvas.style.height = ch;
	canvas2.style.width = cw;
	canvas2.style.height = ch;
	canvas3.style.width = cw;
	canvas3.style.height = ch;
};

const setEvents = () => {
	socket.on('draw', (data) => {
		View.draw(data);
	});
	socket.on('drawPiece', (data) => {
		View.drawPiece(data.piece, data.MODE, data.index);
	});
	socket.on('drawNext', (data) => {
		View.drawNext(data.typeId, data.index);
	});
	socket.on('refreshNexts', () => {
		View.refreshNexts();
	});
	socket.on('drawHold', (data) => {
		View.drawHold(data.typeId, data.mode);
	});
	socket.on('refreshHold', () => {
		View.refreshHold();
	});
	socket.on('clearAnimation', (data) => {
		View.clearAnimation(data.l, data.i);
	});
	socket.on('countDown', (data) => {
		View.countDown(data);
	});
	socket.on('displayScore', (data) => {
		View.displayScore(data);
	});
	socket.on('levelProgress', (data) => {
		View.levelProgress(data.lines, data.level, data.goal);
	});
	socket.on('displayScoreArr', (data) => {
		View.displayScoreArr(data);
	});
	socket.on('lockAnimation', (data) => {
		View.lockAnimation(data.piece, data.frame, data.offset);
	});
	socket.on('hardDropAnimation', (data) => {
		View.hardDropAnimation(data.tarPiece, data.offset);
	});
	socket.on('showGarbage', (data) => {
		View.showGarbage(data);
	});
	socket.on('edraw', (data) => {
		EnemyView.draw(data);
	});
	socket.on('edrawPiece', (data) => {
		EnemyView.drawPiece(data.piece, data.MODE, data.index);
	});
	socket.on('edrawNext', (data) => {
		EnemyView.drawNext(data.typeId, data.index);
	});
	socket.on('erefreshNexts', () => {
		EnemyView.refreshNexts();
	});
	socket.on('edrawHold', (data) => {
		EnemyView.drawHold(data.typeId, data.mode);
	});
	socket.on('erefreshHold', () => {
		EnemyView.refreshHold();
	});
	socket.on('eclearAnimation', (data) => {
		EnemyView.clearAnimation(data.l, data.i);
	});
	socket.on('ecountDown', (data) => {
		EnemyView.countDown(data);
	});
	socket.on('edisplayScore', (data) => {
		EnemyView.displayScore(data);
	});
	socket.on('elevelProgress', (data) => {
		EnemyView.levelProgress(data.lines, data.level, data.goal);
	});
	socket.on('edisplayScoreArr', (data) => {
		EnemyView.displayScoreArr(data);
	});
	socket.on('elockAnimation', (data) => {
		EnemyView.lockAnimation(data.piece, data.frame, data.offset);
	});
	socket.on('ehardDropAnimation', (data) => {
		EnemyView.hardDropAnimation(data.tarPiece, data.offset);
	});
	socket.on('eshowGarbage', (data) => {
		EnemyView.showGarbage(data);
	});
};