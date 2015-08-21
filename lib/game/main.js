ig.module( 
	'game.main' 
)
.requires(
	'plugins.joncom.box2d.game',
	'impact.font',
	'game.levels.testBed',
	'game.levels.testLevel',
	'game.levels.LoopLevel',
	'game.levels.slimeTest',
	'game.levels.Titania',
	'game.levels.PhysicsTest',
	'game.levels.runTest',
	'plugins.camera',
	'plugins.zoneCamera',
	'plugins.gamepad',
	'game.HUD',
	'game.pause',
	'plugins.local',
	'game.title',
	'game.const_defs',
	'plugins.tween'
	,'impact.debug.debug'
	//,'plugins.joncom.box2d.debug'
	,'plugins.machina.machinaJS'
)
.defines(function(){

LoopMain = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	gravity : 98,
	
	//number of tiles in room, for camera controls
	roomSize: {x: 32, y: 16},
	//hacky: manual!
	tileSize: { x:16, y:16},
	bounds: {x:0, y:0},
	player: null,
	camera: null,
	hud: null,
	statMatte: new ig.Image('media/screen-bg.png'),
	clearColor: "#311466",
	currentZone: null,
	debugCollisionRects: true,
	
	entityKillList : [],
	
	//debug
	contactDraw: false,
	contactStart: null,
	contactEnd: null,
	
	worldFSM: null,
	
	//deal with analog sticks
	//states that are between the following threshold states should be snapped downward
	
	
	init: function() {
		// Initialize your game here; bind keys etc.
		
		//hang on to this instance
		ig.global.gameState = this;
		
		ig.Entity._debugShowBoxes = true;
		
		
		
		ig.global.shotCount = 0;
		
		
		
		
		
		//basic key bindings
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.X, 'jump');
		ig.input.bind(ig.KEY.C, 'shoot');
		ig.input.bind(ig.KEY.S, 'blink');
		ig.input.bind(ig.KEY.A, 'magnetize');
		ig.input.bind(ig.KEY.Z, 'missile');
		ig.input.bind(ig.KEY.ENTER, 'pause');
		ig.input.bind(ig.KEY.SPACE, 'save');
		ig.input.bind(ig.KEY.V, 'shield');
		
		//GAMEPAD BINDINGS
		ig.input.bind( ig.GAMEPAD.PAD_LEFT, 'left' );
		ig.input.bind( ig.GAMEPAD.PAD_RIGHT, 'right' );
		ig.input.bind( ig.GAMEPAD.PAD_TOP, 'up');
		ig.input.bind( ig.GAMEPAD.PAD_BOTTOM, 'down');
		ig.input.bind( ig.GAMEPAD.FACE_1, 'jump' );
		ig.input.bind( ig.GAMEPAD.RIGHT_SHOULDER_BOTTOM, 'run' );	
		ig.input.bind( ig.GAMEPAD.RIGHT_SHOULDER, 'shoot' );
		ig.input.bind( ig.GAMEPAD.FACE_4, 'heal');
		ig.input.bind( ig.GAMEPAD.FACE_3, 'melee');
		ig.input.bind( ig.GAMEPAD.START, 'pause');
		ig.input.bind( ig.GAMEPAD.LEFT_SHOULDER, 'shield');
		ig.input.bind(ig.GAMEPAD.FACE_2, 'roll');
		ig.input.bind(ig.GAMEPAD.LEFT_SHOULDER_BOTTOM, 'crouch');
		
		//test for analog sticks
		ig.input.bind (ig.GAMEPAD.LEFT_ANALOGUE_STICK, 'move_stick');
		
		
		
		//set up the camera
		this.camera = new ig.ZoneCamera(ig.system.width/3, ig.system.height/2, 5 );
		this.camera.trap.size.x = ig.system.width/10;
		this.camera.trap.size.y = ig.system.width/5;
		this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width/6 : 0;
		
		//collision categories
		
		this.loadLevel(LevelRunTest);
		
	},
	
	update: function() {
		
		// Update all entities and backgroundMaps
		if (this.player) {
			this.camera.follow(this.player);
		}
		
		//relegate pausing to here:
		if (ig.input.pressed('pause')) {
			ig.system.setGame(PauseScreen);
		}
		
		
		
		this.parent();
		
		//kill deferred bodies
		var killedBody = null;
		while (killedBody = this.entityKillList.pop()) {
			ig.world.DestroyBody(killedBody);
		}
		
		if (this.contactDraw) {
			//do something to freeze the frame
			//ctx.stroke();
		}
		// Add your own, additional update code here
	},
	
	loadLevel: function(level) {
		this.parent(level);
		this.player = this.getEntitiesByType(EntityPlayer)[0];
		//set camera bounds by level bounds
		this.camera.max.x = this.collisionMap.pxWidth - ig.system.width;
		this.camera.max.y = this.collisionMap.pxHeight - ig.system.height;
		
		this.camera.set(this.player);
		
		this.hud = new ig.HUD(this.player);
		
	},
	
	draw: function() {
		//background matte
		this.statMatte.draw(0,0);
		
		this.parent();


		this.camera.draw();
		

		this.hud.draw();
		//this.fauxDebug();
		// Draw all entities and backgroundMaps

		
		
		// Add your own drawing code here
		
	},
	
	//HUD-like debug stats
	fauxDebug: function() {
		var player = ig.game.getEntitiesByType(EntityPlayer)[0];
		var x =5;
		var y = 5;
		if (player) {
			this.font.draw( 'X: ', x, y, ig.Font.ALIGN.LEFT );
			this.font.draw(player.pos.x, x + 12, y, ig.Font.ALIGN.LEFT);
			this.font.draw("Y: ", x, y+12, ig.Font.ALIGN.LEFT);
			this.font.draw(player.pos.y, x+12, y+12, ig.Font.ALIGN.LEFT);
		}
		this.font.draw('CamX: ', x, y + 24, ig.Font.ALIGN.LEFT);
		this.font.draw(this.camera.pos.x, x + 30, y + 24, ig.Font.ALIGN.LEFT);
		this.font.draw('CamY: ', x, y + 36, ig.Font.ALIGN.LEFT);
		this.font.draw(this.camera.pos.y, x+ 30, y+ 36, ig.Font.ALIGN.LEFT);
	},
	
	zoneSet: function(zoneEnt) {
		this.currentZone = zoneEnt;
		this.currentZone.fire();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2


ig.main( '#canvas', LoopMain, 60, 320, 240, 2 );

});
