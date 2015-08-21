//we can save the whole game object by serializing it (somehow), or just store the key attributes manually

ig.module('game.save')
.requires('impact.game', 
'plugins.local'
)
.defines (function() {
	
	ig.Save = ig.Class.extend({
		saveState: function(repo) {
		repo.setData("save", JSON.stringify(ig.game));
	},
	
	anyFunc: function() {
		
	},
	
	loadSave: function(repo) {
		return JSON.parse(repo.getData("save"));
	}
	});
});