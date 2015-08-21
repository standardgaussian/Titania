ig.module('game.const_defs')
.requires('impact.impact')
.defines(function() {
	//set global filtering categories
ig.Filter = {NOCOLLIDE : 0x0000, PC: 0x0002, ENEMY: 0x0004, FRIENDLY: 0x0008, SENSOR: 0x0010, ALL: 0xFFFF, ENVIRON: 0x0001};
});