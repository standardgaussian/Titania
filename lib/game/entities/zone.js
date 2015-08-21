//zone entities
//controls zone camera

ig.module('game.entities.zone')
.requires('impact.entity', 'game.const_defs'
)
.defines( function() {
	EntityZone = ig.Entity.extend({
		_wmScalable: true,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(127,0 , 255, 0.15)',
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		gravityFactor: 0,
		name: null,
		
		target: null,
		
		state: 1,
		
		//collision filter data
		
		categoryBits: ig.Filter.NOCOLLIDE,
		maskBits: 0,
		
		fire: function() {
			if (this.target)	{
				console.log("Firing zone ", this.name);
				var ent = ig.game.getEntityByName( this.target );
				ent.check(this);
			}
		},
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			if (!ig.global.wm) {
				var fix = this.body.GetFixtureList();	//assumes only 1 (box) fixture on body
				var filterData = fix.GetFilterData();
				filterData.categoryBits = this.categoryBits;
				filterData.maskBits = this.maskBits;
				fix.SetFilterData(filterData);
			}
		}
		
	});
});