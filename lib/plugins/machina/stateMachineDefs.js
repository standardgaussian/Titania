ig.module('plugins.machina.stateMachineDefs').
requires('plugins.machina.machinaJS').
defines(function() {
	ig.Machines = ig.Class.extend({
		machines: [],
		
		add: function(name, opts) {
			this.machines[name] = opts;
		},
		
		getDef: function(name) {
			if (this.machines[name]) {
				return this.machines[name];
			}
			else {
				throw "Cannot find def";
			}
		},
		
		
	});
	
	ig.Machines = new ig.Machines();	//why can't I do this anonymously? Might need to .bind, but this should work anyway.
	
	
	ig.Machines.add("testMachine",
	
	{
		initialize: function(options) {
			
		},
		
		initialState: "uninitialized",
		
		states: {
			uninitialized: {
				"*": function() {
					console.log("Leaving uninitialized state");
					this.deferUntilTransition();
					this.transition("testOne");
				},
				
				
				
			},
			
			testOne: {
				_onEnter: function() {
					console.log("Entering testOne");
					this.timer = setTimeout( function() {
						this.handle("timeout");
					}.bind(this), 3000);
					console.log(this.timer);
				},
				
				walking: "testTwo",
				
				"*" : function() {
					this.timer = setTimeout( function() {
						this.handle("timeout");
					}.bind(this), 3000);
				},
				
				timeout: "testOneIdle",
				
				
				
				
			},
			
			testTwo: {
				
				_onEnter: function() {
					console.log("Stuck in terminal state testTwo");
					console.log(this);
				},
				
				"*": function() {
					this.transition("testTwo");
				},
			
			},
			
			testOneIdle: {
				_onEnter: function() {
					console.log("Idling in testOne");
				},
				
				walking: "testTwo",
				
				"*": "testOne",
			},
			
			
			
		},
		
		anything: function() {
			this.handle("*");
		},
		
		walking: function() {
			this.handle("walking");
		},
	
		
		
		
		
		
	});
	
	ig.Machines.add("player",
	{
		initialize: function(options) {
			
		},
		
		initialState: "uninitialized",
		
		states: {
			uninitialized: {
				
				toIdle: {},
				
			},
			
			idle: {
				
				toWalking: {},
				
				toRunning: {},
				
				toCrouching: {},
				
				toShooting: {},
				
				toRolling: {},
				
				toJumping: {},
				
				toFalling: {},
				
				toHealing: {},
				
				toKnockedDown: {},
				
				toHitsunned: {},
				
				toHardStunned: {},
				
			},
			
			walking: {
				
			},
			
			running: {
				
				toWalking: {},
				
				toRolling: {},
				
				toVaulting: {},
				
				toJumping: {},
				
				toFalling: {},
				
				toKnockedDown: {},
				
				toHitsunned: {},
				
				toHardStunned: {},
				
				
				
				
			},
			
			crouching: {
				
				toIdle: {},
				
				toShooting: {},
				
				toRolling: {},
				
				toInCover: {},
				
				toFalling: {},
				
				toKnockedDown: {},
				
				toHitsunned: {},
				
				toHardStunned: {},
				
			},
			
			shooting: {
				
				toIdle: {},
				
				toFalling: {},
				
				toWalking: {},
				
				toJumping: {},
		
				toKnockedDown: {},
				
				toHitsunned: {},
				
				toHardStunned: {},
			},
			
			rolling: {
				
				toIdle: {},
				
				toWalking: {},
				
				toInCover: {},
				
				
				toKnockedDown: {},
				
				toHitsunned: {},
				
				toHardStunned: {},
				
			},
			
			onLedge: {
				
			},
			
			inCover: {
				
			},
			
			exposedInCover: {
				
			},
			
			vaulting: {
				
			},
			
			jumping: {
				
				toIdle: {},
				
				toOnLedge: {},
				
				toFalling: {},
				
				toShooting: {},
				
				toDiving: {},
				
			},
			
			falling: {
				
				
			},
			//dodging while falling?
			diving: {
				
				
			},
			
			knockedDown: {
				
			},
			//using items? etc:.
			healing: {
				
			},
			//loss of control from damage
			hitstunned: {
				
			},
			//special stun status
			hardStunned: {
				
			},
			
			//activating energy shield
			shielding: {
				
			},
			
			
			
		}
		
		
		
		
		
		
	});
	
	
	
	
	
	

});