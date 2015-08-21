//generates entities 

ig.module('game.entities.spawnGenerator')
.requires('impact.entity')
.defines(function() {
	EntitySpawnGenerator = ig.Entity.extend({
		_wmScalable: true,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(127,127 , 255, 0.4)',
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		targetZone: null,
		spawnTarget: {},
		size: {x: 16, y:16},
		settings: null,
		entityLink: false,
		gravityFactor: 0,
		spawnSettings: {},
		name: null,
		
		init: function(x,y, settings) {
			this.pos.x = x;
			this.pos.y = y;
			this.settings = settings;
			
			this.parent(x,y,settings);
			this.spawnSettings.name = this.name.concat("Gen");
		},
		
		changeSpawn: function(strEnt) {
			if (strEnt) {
				this.spawnTarget = strEnt;
			}
		},
		
		triggeredBy: function(other, trigger) {
			this.reset();
			this.spawn(other.state);
		},
		
		spawn: function(state) {
			if (this.spawnTarget[state] && !this.genLinked()) {
				ig.game.spawnEntity(this.spawnTarget[state], this.pos.x, this.pos.y, this.spawnSettings);
				
			}
		},
		
		reset: function() {
			var ent = ig.game.getEntityByName(this.name.concat("Gen"));
			if (ent && ent._killed != true) {
				ig.game.removeEntity(ent);
			}
		},
		
		changeZone: function(zone) {
			if (zone) {
				this.targetZone = zone;
			}
		},
		
		genLinked: function() {
			var ent = ig.game.getEntityByName(this.name.concat("Gen"));
			if (!ent || ent._killed == true) {
				return false;
			}
			else {
				return true;
			}
		}
		
		
	});
	
});