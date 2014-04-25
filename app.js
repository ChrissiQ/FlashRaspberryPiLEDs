var gpio = require("pi-gpio")
var async = require("async")

var arg = process.argv.slice(2)

var time = arg || 1 

var writing

var open = function (pin, callback) {
	gpio.open(pin, "output", function(err) {
		if (callback !== undefined) callback()
	}) 
}
var asyncOpen = function(pin) {
	return function(callback){
		open(pin, function(){
			callback(null, "Opened pin " + pin)
		})
	}
}
var set = function(pin, value, callback, force) {
	if (writing || force) {	
		if (callback === undefined)
			gpio.write(pin, value)
		else
			gpio.write(pin, value, callback)
	}
}
var on = function(pin, callback, force) {
	set(pin, 1, callback, force)
}
var off = function(pin, callback, force) {
	set(pin, 0, callback, force)
}
var close = function (pin, callback) {
	off(pin, function(){
		if (callback === undefined)
			gpio.close(pin)
		else
			gpio.close(pin, callback)
	}, true)
}
var asyncClose = function(pin) {
	return function(callback){
		close(pin, function(){
			callback(null, 'Closed pin ' + pin)
		})
	}
}

//
// END
//

process.stdin.resume()
process.on('SIGINT', function() {
	writing = false
	async.parallel([
		asyncClose(12),
		asyncClose(16)	
	], function(err, results){
		console.log(results)
		process.exit()
	})
})

//
// START
//
async.parallel([
	asyncOpen(16),
	asyncOpen(12)
], function(err, results) {
	console.log(results)	

	writing = true

	setInterval(function() {

		on(16)

		setTimeout(function(){
			on(12)
		}, time)  

		setTimeout(function() {
			off(16)
		}, time*2)

		setTimeout(function() {
			off(12)
		}, time*3)

	}, time*4)
})
