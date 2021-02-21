const Player = require('./Tetris/Player');
const Random = require('./Random.js');

const {io, ee} = require('../server.js');

class RoomManager {
	constructor() {
		this.rooms = [];
		this.playingRooms = [];
		
		this.now = 0;
		this.last = 0;
		
		setInterval(()=>this.update(),1000/60);
	}

	create = (player0, player1) => {
		let roomNum = player0.id + player1.id;
		let room = new Room(roomNum, player0, player1);

		player0.join(roomNum);
		player1.join(roomNum);
		
		io.to(roomNum).emit('in');
		
		this.rooms.push(room);
		room.start();
		console.log(`Created room for ${player0.id} & ${player1.id}`);
	};

	findRoomIndex = (socket) => {
		let roomIndex = null;
		this.rooms.some((room, index) => {
			for (let object in room.objects) {
				let obj = room.objects[object];
				if (obj.id == socket.id) {
					roomIndex = index;
					return true;
				}
			}
		});
		return roomIndex;
	};

	update = ( ) => {
		this.now = Date.now();
		let dt = (this.now - this.last)/1000;
		this.last = this.now;
		
		for(var roomId in this.rooms){
			var room = this.rooms[roomId];
			room.update(dt)
		}
	}
}

class Room {
	constructor(id, p0, p1) {
		this.id = id;
		this.player0 = p0;
		this.player1 = p1;
		this.status = STATUS.WAITING;
		this.obj = {};
		
		let randomizer = new Random();
		this.obj[this.player0.id] = new Player(p0,p1, randomizer);
		this.obj[this.player1.id] = new Player(p1,p0, randomizer);
	}

	start = () =>{
		console.log(`starting game`);
		this.obj[this.player0.id].countDown();
		this.obj[this.player1.id].countDown();
		
		setTimeout(()=>{
			this.status = STATUS.PLAYING;
		},3000);
	};
	
	update = (dt) => {
		if (this.status == STATUS.PLAYING) {
			this.obj[this.player0.id].update(dt);
			this.obj[this.player1.id].update(dt);
		}
	};
}

const STATUS = {
	WAITING: 0,
	PLAYING: 1,
};

module.exports = RoomManager;