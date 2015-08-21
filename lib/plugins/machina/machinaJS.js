ig.module('plugins.machina.machinaJS')
.requires('impact.impact')
.defines(function() {
	
	MachinaJS = ig.Class.extend({ 
		opts: null,
		
		Create: function(opts) {
			if (opts == null || opts == undefined) {
				opts = this.opts;
			}
			if (opts == null || opts == undefined) {
				throw "Cannot create state machine. No state machine definition is present."
			}
			var pushdown = machina.Fsm.extend({
				stateStack: [],
				
				peek: function() {
					if (stateStack.length > 0) 
						return stateStack[stateStack.length-1];
					else
						return null;
				},
				
				push: function(state) {
					this.stateStack.push(state);
					
					
				},
				
				pop: function() {
					return this.stateStack.pop();
				},
				
				transitionToValid: function() {
					var toState = this.pop();
					do {
						if (this.states[this.state]['to'+toState.toString()]) {
							this.states[this.state]['to'+toState.toString()];
							return toState;
						}
					} while (toState = this.pop());
					//handle nothing to return to here
					return null;
				},
				
				
				
				
			});
			return new pushdown(opts);
		},
		
		setOpts: function(opts) {
			this.opts = opts;
		},
	
		
	});	
	
	ig.machinaJS = new MachinaJS();
	
});