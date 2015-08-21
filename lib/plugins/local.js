//wrapper around local storage functions

ig.module('plugins.local').
requires()
.defines(function() {
	ig.local = ig.Class.extend({ 
		setData: function(key, data) {
			localStorage.setItem(key,data);
		},
		
		getData: function(key) {
			return localStorage.getItem(key);
		},
	});
});