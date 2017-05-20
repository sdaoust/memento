(function() {
	var food = new Food(entry());
	if(food.servings.length > 0) {
		message("Delete this food's servings first");
		cancel();
	} else if (food.recipe) {
		message("Delete this food's recipe first");
		cancel();
	}
})();