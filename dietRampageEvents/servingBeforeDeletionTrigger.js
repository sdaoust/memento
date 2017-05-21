(function() {
	var serving = new Serving(entry());
	if (serving.forRecipes.length > 0) {
		message("Delete the recipes that use this serving first");
		cancel();
	}
})();