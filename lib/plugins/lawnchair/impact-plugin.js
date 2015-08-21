ig.module(
	'plugins.lawnchair.impact-plugin'
)
.requires(
)
.defines(function(){
	
	ig.Lawnchair = ig.Class.extend({
	
		staticInstantiate: function(options) {
			var name = 'records';
			if (options) {
				if (typeof options == 'string') { 
					name = options;
				} else if (typeof options.name != 'undefined') {
					name = options.name;
				}
			}
			var inst = ig.Lawnchair.instances[name];
			if(!inst) {
				return null;
			} else {
				//console.log('returned existing store: ' + name);
				return inst;
			}
		},
		
		init: function() {
			
			// lawnchair requires json 
			if (!JSON) throw 'JSON unavailable! Download json2 from github'
			
			// options are optional; callback is not
			if (arguments.length <= 2 && arguments.length > 0) {
				var callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1]
				,   options  = (typeof arguments[0] === 'function') ? {} : arguments[0]
				
				// If first argument is a string, use that as the store name
				if (typeof arguments[0] === 'string') {
					options = { name: arguments[0] };
				}
				
			} else {
				throw 'Incorrect # of ctor args!'
			}

			if (typeof callback !== 'function') { 
				callback = this.callbackDefault;
			}

			// default configuration 
			this.record = options.record || 'record'  // default for records
			this.name   = options.name   || 'records' // default name for underlying store
			
			ig.Lawnchair.instances[this.name] = this;
			
			// mixin first valid  adapter
			var adapter
			// if the adapter is passed in we try to load that only
			if (options.adapter) {
				adapter = ig.Lawnchair.adapters[ig.Lawnchair.adapters.indexOf(options.adapter)]
				adapter = adapter.valid() ? adapter : undefined
			// otherwise find the first valid adapter for this env        
			} else {
				for (var i = 0, l = ig.Lawnchair.adapters.length; i < l; i++) {
					adapter = ig.Lawnchair.adapters[i].valid() ? ig.Lawnchair.adapters[i] : undefined
					if (adapter && (options && options.adapterName && options.adapterName == adapter.adapter)) break 
				}
			} 
			// we have failed 
			if (!adapter) throw 'No valid adapter.' 
			// yay! mixin the adapter 
			for (var j in adapter) { 
				this[j] = adapter[j]
			}
			// call init for each mixed in plugin
			for (var i = 0, l = ig.Lawnchair.plugins.length; i < l; i++) 
				ig.Lawnchair.plugins[i].call(this)

			// init the adapter 
			 this.initAdapter(options, callback)
		},

		isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]' },

		// awesome shorthand callbacks as strings. this is shameless theft from dojo.
		lambda: function (callback) {
			return this.fn(this.record, callback)
		},

		// first stab at named parameters for terse callbacks; dojo: first != best // ;D
		fn: function (name, callback) {
			return typeof callback == 'string' ? new Function(name, callback) : callback
		},

		// returns a unique identifier (by way of Backbone.localStorage.js)
		// TODO investigate smaller UUIDs to cut on storage cost
		uuid: function () {
			var S4 = function () {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			}
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},

		// a classic iterator
		each: function (callback) {
			var cb = this.lambda(callback)
			// iterate from chain
			if (this.__results) {
				for (var i = 0, l = this.__results.length; i < l; i++) cb.call(this, this.__results[i], i) 
			}  
			// otherwise iterate the entire collection 
			else {
				this.all(function(r) {
					for (var i = 0, l = r.length; i < l; i++) cb.call(this, r[i], i)
				})
			}
			return this
		},
		
		callbackDefault: function() {
			
		}
	
	
	});
	
	ig.Lawnchair.adapters = [];
	ig.Lawnchair.plugins = [];
	ig.Lawnchair.instances = {};
	
	ig.Lawnchair.adapter = function (id, obj) {
		// add the adapter id to the adapter obj
		// ugly here for a  cleaner dsl for implementing adapters
		obj['adapter'] = id
		// methods required to implement a lawnchair adapter 
		var implementing = 'adapter valid initAdapter keys save batch get exists all remove nuke'.split(' ')
		// mix in the adapter 	
		for (var i in obj) if (implementing.indexOf(i) === -1) throw 'Invalid adapter "' + id + '", Nonstandard method: ' + i
		// if we made it this far the adapter interface is valid 
		ig.Lawnchair.adapters.push(obj)
	};
	
	ig.Lawnchair.plugin = function (obj) {
		for (var i in obj) 
			i === 'init' ? ig.Lawnchair.plugins.push(obj[i]) : this.prototype[i] = obj[i]
	};

	/**
	*
	* Adapters supported in this plugin:
	* dom, memory, webkit-sqlite
	*
	*/

	/**
	 * dom storage adapter 
	 * === 
	 * - originally authored by Joseph Pecoraro
	 *
	 */ 
	//
	// TODO does it make sense to be chainable all over the place?
	// chainable: nuke, remove, all, get, save, all    
	// not chainable: valid, keys
	//
	ig.Lawnchair.adapter('dom', {
		// ensure we are in an env with localStorage 
		valid: function () {
			return window.Storage != 'undefined' 
		},

		initAdapter: function (options, callback) {
			// yay dom!
			this.storage = window.localStorage
			// indexer helper code
			var self = this
			// the indexer is an encapsulation of the helpers needed to keep an ordered index of the keys
			this.indexer = {
				// the key
				key: self.name + '._index_',
				// returns the index
				all: function() {
					var a = JSON.parse(self.storage.getItem(this.key))
					if (a == null) self.storage.setItem(this.key, JSON.stringify([])) // lazy init
					return JSON.parse(self.storage.getItem(this.key))
				},
				// adds a key to the index
				add: function (key) {
					var a = this.all()
					a.push(key)
					self.storage.setItem(this.key, JSON.stringify(a))
				},
				// deletes a key from the index
				del: function (key) {
					var a = this.all(), r = []
					// FIXME this is crazy inefficient but I'm in a strata meeting and half concentrating
					for (var i = 0, l = a.length; i < l; i++) {
						if (a[i] != key) r.push(a[i])
					}
					self.storage.setItem(this.key, JSON.stringify(r))
				},
				// returns index for a key
				find: function (key) {
					var a = this.all()
					for (var i = 0, l = a.length; i < l; i++) {
						if (key === a[i]) return i 
					}
					return false
				}
			}

			if (callback) this.fn(this.name, callback).call(this, this)  
		},
		
		save: function (obj, callback) {
			var key = obj.key || this.uuid()
			// if the key is not in the index push it on
			if (!this.indexer.find(key)) this.indexer.add(key)
			// now we kil the key and use it in the store colleciton	
			delete obj.key;
			this.storage.setItem(key, JSON.stringify(obj))
			if (callback) {
				obj.key = key
				this.lambda(callback).call(this, obj)
			}
			return this
		},

		batch: function (ary, callback) {
			var saved = []
			// not particularily efficient but this is more for sqlite situations
			for (var i = 0, l = ary.length; i < l; i++) {
				this.save(ary[i], function(r){
					saved.push(r)
				})
			}
			// FIXME this needs tests
			if (callback) this.lambda(callback).call(this, saved)
			return this
		},
	   
		// accepts [options], callback
		keys: function() {
			// TODO support limit/offset options here
			var limit = options.limit || null
			,   offset = options.offset || 0
			if (callback) this.lambda(callback).call(this, this.indexer.all())
		},
		
		get: function (key, callback) {
			if (this.isArray(key)) {
				var r = []
				for (var i = 0, l = key.length; i < l; i++) {
					var obj = JSON.parse(this.storage.getItem(key[i]))
					if (obj) {
						obj.key = key[i]
						r.push(obj)
					} 
				}
				if (callback) this.lambda(callback).call(this, r)
			} else {
				var obj = JSON.parse(this.storage.getItem(key))
				if (obj) obj.key = key
				if (callback) this.lambda(callback).call(this, obj)
			}
			return this
		},
		// NOTE adapters cannot set this.__results but plugins do
		// this probably should be reviewed
		all: function (callback) {
			var idx = this.indexer.all()
			,   r   = []
			,   o
			for (var i = 0, l = idx.length; i < l; i++) {
				o = JSON.parse(this.storage.getItem(idx[i]))
				o.key = idx[i]
				r.push(o)
			}
			if (callback) this.fn(this.name, callback).call(this, r)
			return this
		},
		
		remove: function (keyOrObj, callback) {
			var key = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key
			this.indexer.del(key)
			this.storage.removeItem(key)
			if (callback) this.lambda(callback).call(this)
			return this
		},
		
		nuke: function (callback) {
			this.all(function(r) {
				for (var i = 0, l = r.length; i < l; i++) {
					this.remove(r[i]);
				}
				if (callback) this.lambda(callback).call(this)
			})
			return this 
		}
	});

	/**
	* Memory adapter
	*/
	ig.Lawnchair.adapter('memory', (function(){

		var storage = {}, index = []

		return {
			valid: function() { return true },

			initAdapter: function(opts, cb) {
				this.fn(this.name, cb).call(this, this)
				return this
			},

			keys: function() { return index },

			save: function(obj, cb) {
				var key = obj.key || this.uuid()
				
				if (obj.key) delete obj.key 
			   
				this.exists(key, function(exists) {
					if (!exists) index.push(key)

					storage[key] = obj
					
					if (cb) {
						obj.key = key
						this.lambda(cb).call(this, obj)
					}
				})

				return this
			},

			batch: function (objs, cb) {
				var r = []
				for (var i = 0, l = objs.length; i < l; i++) {
					this.save(objs[i], function(record) {
						r.push(record)
					})
				}
				if (cb) this.lambda(cb).call(this, r)
				return this
			},

			get: function (keyOrArray, cb) {
				var r;
				if (this.isArray(keyOrArray)) {
					r = []
					for (var i = 0, l = keyOrArray.length; i < l; i++) {
						r.push(storage[keyOrArray[i]]) 
					}
				} else {
					r = storage[keyOrArray]
					if (r) r.key = keyOrArray
				}
				if (cb) this.lambda(cb).call(this, r)
				return this 
			},

			exists: function (key, cb) {
				this.lambda(cb).call(this, !!(storage[key]))
				return this
			},

			all: function (cb) {
				var r = []
				for (var i = 0, l = index.length; i < l; i++) {
					var obj = storage[index[i]]
					obj.key = index[i]
					r.push(obj)
				}
				this.fn(this.name, cb).call(this, r)
				return this
			},

			remove: function (keyOrArray, cb) {
				var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
				for (var i = 0, l = del.length; i < l; i++) {
					delete storage[del[i]]
					index.splice(index.indexOf(del[i]), 1)
				}
				if (cb) this.lambda(cb).call(this)
				return this
			},

			nuke: function (cb) {
				storage = {}
				index = []
				if (cb) this.lambda(cb).call(this)
				return this
			}
		}
	/////
	})())

	/**
	* WebKit Sqlite adapter
	*/
	ig.Lawnchair.adapter('webkit-sqlite', (function () {
		// private methods 
		var fail = function (e, i) { console.log('error in sqlite adaptor!', e, i) }
		,   now  = function () { return new Date() } // FIXME need to use better date fn
		// not entirely sure if this is needed...
		if (!Function.prototype.bind) {
			Function.prototype.bind = function( obj ) {
				var slice = [].slice
				,   args  = slice.call(arguments, 1) 
				,   self  = this
				,   nop   = function () {} 
				,   bound = function () {
						return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments))) 
					}
				nop.prototype   = self.prototype
				bound.prototype = new nop()
				return bound
			}
		}

		// public methods
		return {
		
			valid: function() { return !!(window.openDatabase) },

			initAdapter: function (options, callback) {
				var that   = this
				,   cb     = that.fn(that.name, callback)
				,   create = "CREATE TABLE IF NOT EXISTS " + this.name + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)"
				,   win    = cb.bind(this)
				// open a connection and create the db if it doesn't exist 
				this.db = openDatabase(this.name, '1.0.0', this.name, 65536)
				this.db.transaction(function (t) { 
					t.executeSql(create, [], win, fail) 
				})
			}, 

			keys:  function (callback) {
				var cb   = this.lambda(callback)
				,   that = this
				,   keys = "SELECT id FROM " + this.name + " ORDER BY timestamp DESC"

				this.db.transaction(function(t) {
					var win = function (xxx, results) {
						if (results.rows.length == 0 ) {
							cb.call(that, [])
						} else {
							var r = [];
							for (var i = 0, l = results.rows.length; i < l; i++) {
								r.push(results.rows.item(i).id);
							}
							cb.call(that, r)
						}
					}
					t.executeSql(keys, [], win, fail)
				})
				return this
			},
			// you think thats air you're breathing now?
			save: function (obj, callback) {
				var that = this
				,   id   = obj.key || that.uuid()
				,   ins  = "INSERT INTO " + this.name + " (value, timestamp, id) VALUES (?,?,?)"
				,   up   = "UPDATE " + this.name + " SET value=?, timestamp=? WHERE id=?"
				,   win  = function () { if (callback) { obj.key = id; that.lambda(callback).call(that, obj) }}
				,   val  = [now(), id]
				// existential 
				that.exists(obj.key, function(exists) {
					// transactions are like condoms
					that.db.transaction(function(t) {
						// TODO move timestamp to a plugin
						var insert = function (obj) {
							val.unshift(JSON.stringify(obj))
							t.executeSql(ins, val, win, fail)
						}
						// TODO move timestamp to a plugin
						var update = function (obj) {
							delete(obj.key)
							val.unshift(JSON.stringify(obj))
							t.executeSql(up, val, win, fail)
						}
						// pretty
						exists ? update(obj) : insert(obj)
					})
				});
				return this
			}, 

			// FIXME this should be a batch insert / just getting the test to pass...
			batch: function (objs, cb) {
				
				var results = []
				,   done = false
				,   that = this

				var updateProgress = function(obj) {
					results.push(obj)
					done = results.length === objs.length
				}

				var checkProgress = setInterval(function() {
					if (done) {
						if (cb) that.lambda(cb).call(that, results)
						clearInterval(checkProgress)
					}
				}, 200)

				for (var i = 0, l = objs.length; i < l; i++) 
					this.save(objs[i], updateProgress)
				
				return this
			},

			get: function (keyOrArray, cb) {
				var that = this
				,   sql  = ''
				// batch selects support
				if (this.isArray(keyOrArray)) {
					sql = 'SELECT id, value FROM ' + this.name + " WHERE id IN ('" + keyOrArray.join("','") + "')"
				} else {
					sql = 'SELECT id, value FROM ' + this.name + " WHERE id = '" + keyOrArray + "'"
				}	
				// FIXME
				// will always loop the results but cleans it up if not a batch return at the end..
				// in other words, this could be faster
				var win = function (xxx, results) {
					var o = null
					,   r = []
					if (results.rows.length) {
						for (var i = 0, l = results.rows.length; i < l; i++) {
							o = JSON.parse(results.rows.item(i).value)
							o.key = results.rows.item(i).id
							r.push(o)
						}
					}
					if (!that.isArray(keyOrArray)) r = r.length ? r[0] : null
					if (cb) that.lambda(cb).call(that, r)
				}
				this.db.transaction(function(t){ t.executeSql(sql, [], win, fail) })
				return this 
			},

			exists: function (key, cb) {
				var is = "SELECT * FROM " + this.name + " WHERE id = ?"
				,   that = this
				,   win = function(xxx, results) { if (cb) that.fn('exists', cb).call(that, (results.rows.length > 0)) }
				this.db.transaction(function(t){ t.executeSql(is, [key], win, fail) })
				return this
			},

			all: function (callback) {
				var that = this
				,   all  = "SELECT * FROM " + this.name
				,   r    = []
				,   cb   = this.fn(this.name, callback) || undefined
				,   win  = function (xxx, results) {
					if (results.rows.length != 0) {
						for (var i = 0, l = results.rows.length; i < l; i++) {
							var obj = JSON.parse(results.rows.item(i).value)
							obj.key = results.rows.item(i).id
							r.push(obj)
						}
					}
					if (cb) cb.call(that, r)
				}

				this.db.transaction(function (t) { 
					t.executeSql(all, [], win, fail) 
				})
				return this
			},

			remove: function (keyOrObj, cb) {
				var that = this
				,   key  = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key
				,   del  = "DELETE FROM " + this.name + " WHERE id = ?"
				,   win  = function () { if (cb) that.lambda(cb).call(that) }

				this.db.transaction( function (t) {
					t.executeSql(del, [key], win, fail);
				});

				return this;
			},

			nuke: function (cb) {
				var nuke = "DELETE FROM " + this.name
				,   that = this
				,   win  = cb ? function() { that.lambda(cb).call(that) } : function(){}
					this.db.transaction(function (t) { 
					t.executeSql(nuke, [], win, fail) 
				})
				return this
			}
	//////
	}})())
	
	
});
