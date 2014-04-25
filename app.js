var gpio	= require("pi-gpio")
  , async	= require("async")

  , arg		= process.argv.slice(2)
  , time	= arg || 1

  , writing

  , steps = [
		function(){on(16)},
		function(){on(12)},
		function(){off(16)},
		function(){off(12)}
	]

  , step = function(steps, delay){
		steps.forEach(function(element, index) {
			if (index === 0) element()
			else {
				setTimeout(function(){
					element()
				}, delay*index)
			}
		})
	}

  , open = function (pin, callback) {
		gpio.open(pin, "output", function(err) {
			if (callback !== undefined) callback()
		})
	}

  , close = function (pin, callback) {
		off(pin, function(){
			gpio.close(pin, callback)
		}, true)
	}

  , openAsync = function(pin) {
		return function(callback){
			open(pin, function(){
				callback(null, "Opened pin " + pin)
			})
		}
	}

  , closeAsync = function(pin) {
		return function(callback){
			close(pin, function(){
				callback(null, 'Closed pin ' + pin)
			})
		}
	}

  , set = function(pin, value, callback, force) {
		if (writing || force) {
			if (callback === undefined)
				gpio.write(pin, value)
			else
				gpio.write(pin, value, callback)
		}
	}

  , on = function(pin, callback, force) {
		set(pin, 1, callback, force)
	}

  , off = function(pin, callback, force) {
		set(pin, 0, callback, force)
	}

//
// END
//

// Allow ctrl+c to not end the process.
process.stdin.resume()
process.on('SIGINT', function() {

	writing = false

	async.parallel([

		closeAsync(12),
		closeAsync(16)

	], function(err, results){
		console.log(results)
		process.exit()
	})

})

//
// START
//
async.parallel([

	openAsync(16),
	openAsync(12)

], function(err, results) {
	console.log(results)

	writing = true

	setInterval(
		function() { step(steps, time) },
		time*steps.length
	)
})
