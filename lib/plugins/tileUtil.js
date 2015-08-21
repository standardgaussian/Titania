//get pixel, return tile
//some useful functions that require or produce position information have tile variants, some only use pixels
//This is a generic library that fetches tile info for pixels, tile transformations for pixel transformations, etc:
//Obviously, there is a loss of precision, and this should be used for tile-scope interaction and not hit detection, movement, etc:. 

ig.module('plugins.tileUtil').
requires('impact.game', 'impact.map').
defines(function() {
	
	TileUtil = ig.Class.extend( {
	pxToTile: function(pX, pY) {
		var tX, tY;
		if (pX && pY && ig.game.collisionMap.tilesize) {
			tX = Math.floor(pX/ig.game.collisionMap.tilesize);
			tY = Math.floor(pY/ig.game.collisionMap.tilesize);
			return {tX: tX, tY: tY};
		}
		else {
			return undefined;
		}
	},
	
	tileToPx: function(tX, tY) {
		var pX, pY;
		if (tX >= 0 && tY >= 0 && ig.game.collisionMap.tilesize) {
			pX = tX*ig.game.collisionMap.tilesize;
			pY = tY*ig.game.collisionMap.tilesize;
			return {pX: pX, pY: pY};
		}
		else {
			return {pX: -1, pY: -1};
		}
	},
	
	//how much of an entity is in or on a certain tile. Returns 0 if not in or on the tile at all, undefined for error.
	//values from 0 to 1 (in increments of 1/tilesize)
	tilePresence: function(tile, entity, dim) {
		if (!(tile.tX >= 0 && tile.tY >= 0 && (dim == 'x' || dim == 'y'))) {
			return undefined;
		}
		
		if (dim == 'x') {
			var px = this.tileToPx(tile.tX, tile.tY).pX;
			if (entity.pos.x < px) {
				var presence = ((entity.pos.x + entity.size.x) - px)/ig.game.collisionMap.tilesize;
				if (presence > 0 && presence < 1) {
					return presence;
				}
				else {
					return 0;
				}
			}
			else {
				if (tile.tX != (this.pxToTile(entity.pos.x, entity.pos.y).tX)) {
					return 0;
				}
				var presence = 1 - ((entity.pos.x - px)/ig.game.collisionMap.tilesize);
				if (presence > 0 && presence < 1) {
					return presence;
				}
				else {
					return 0;
				}
			}
		}
		
		else if (dim == 'y') {
			var py = this.tileToPx(tile.tX, tile.tY).pY;
			if (entity.pos.y < py) {
				var presence = ((entity.pos.y + entity.size.y) - py)/ig.game.collisionMap.tilesize;
				if (presence > 0 && presence < 1) {
					return presence;
				}
				else {
					return 0;
				}
			}
			else {
				var presence = 1 - ((entity.pos.y - py)/ig.game.collisionMap.tilesize);
				if (presence > 0 && presence < 1) {
					return presence;
				}
				else {
					return 0;
				}
			}
		}
	}
	});
	
	tileUtil = new TileUtil();
	
});