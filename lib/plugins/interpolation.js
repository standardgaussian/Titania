//interpolation module
//returns standard interpolation results based on input vectors and easing algorithms

ig.module('plugins.interpolation')
.requires()
.defines(function() {
	Interpolation = ig.Class.extend({
		//top level utilities to do a single interpolation
		//implement interpolation handler afterwards
		
		lerp: function(position, start, end, total) {
			var delta = end - start;
			return (delta*(position/total) + start);
		},
		
		quadIn: function(position, start, end, total) {
			var delta = end - start;
			var ratio = position/total;
			return (delta*ratio*ratio + start);
		},
		
		quadOut: function(position, start, end, total) {
			var delta = end - start;
			var ratio = position/total;
			return (-delta*ratio*(ratio-2) + start);
		},
		
		quadInOut: function(position, start, end, total) {
			var delta = (end - start)/2;
			var ratio = position/(total/2);
			if (ratio < 1) {
				return ig.Interpolate.quadIn(ratio, start, end - delta, total);
			}
			else {
				ratio--;
				return ig.Interpolate.quadOut(ratio, start + delta, end, total); 
			}
		},
	});
	
	ig.Interpolation = new Interpolation();
});