(function() {
	var drops = DropCollection.get();
	for (var i=0; i<drops.length; i++) {
		var drop = drops[i];
		drop.update();
	}
})();