(function() {
	var drops = DropCollection.get();
	for (var i=0; i<drops.length; i++) {
		drop.update();
	}
})();