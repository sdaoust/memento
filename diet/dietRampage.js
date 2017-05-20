// FOOD INTERFACE

var FoodData = function FoodData() {}
FoodData.prototype = (function() {

	var dataObject = new Data();
	dataObject._initData = dataObject._init;

	return mergeMaps(
		dataObject,
		{
			constructor   : Food,
			_init		  : init,
			update		  : update,
			_updateVolume : updateVolume
		}
	);

	function init(entry, isNutritionCalculated) {
		this._initData(entry);

		var nutritionPropertyType = 
			isNutritionCalculated ? 
			Data.PROPERTY_TYPES.CALCULATION : 
			Data.PROPERTY_TYPES.DEFAULT;
			
		this._addProperties({
			"Weight (grams)" 	 : { variable : "grams" },
			"Volume (cups)"  	 : { variable : "cups" },
			"Volume (tsp)"	 	 : { variable : "tsp" },
			"Other Serving Size" : {},
			"Other Serving Type" : {},
			"Calories"			 : { type : nutritionPropertyType },
			"Protein"			 : { type : nutritionPropertyType },
			"Carbs"				 : { type : nutritionPropertyType },
			"Fat"				 : { type : nutritionPropertyType },
		});
	}

	function update() {
		this._logParams("update");
		this._updateVolume();
		this._logReturn("update");
	}

	function updateVolume() {
		this._logParams("updateVolume");

		if ( this.cups && 
			(this.cups >= Food.CUP_MIN || !this.tsp)
		) {
			this.tsp = this.cups * Food.TSP_IN_CUP;
		}

		else if ( this.tsp &&
				 (this.tsp < Food.TSP_MAX || !this.cups)
		) {
			this.cups = this.tsp / Food.TSP_IN_CUP;
		}

		this._logReturn("updateVolume");
	}
	
})();

// FOOD
 
var Food = function Food(entry) {
	this._init(entry);
	this._addProperties({
		"Name"     : {},
		"Brand"    : {},
		"Servings" : { type : Data.PROPERTY_TYPES.CUSTOM },
		"Recipe"   : { type : Data.PROPERTY_TYPES.CUSTOM },
	});
}
Food.TSP_IN_CUP = 48;
Food.CUP_MIN = 0.25;
Food.TSP_MAX = Food.CUP_MIN * Food.TSP_IN_CUP;
Food.prototype = (function() {

	return mergeMaps(
		new FoodData(),
		{ 
			constructor  : Food,
			_getServings : getServings,
			_getRecipe	 : getRecipe,
			toString	 : toString,
		}
	);
	
	function getServings() {
		this._logParams("getServings");
		
		if (!this._servings) {
			this._servings = [];
			var servings = ServingCollection.get();
			for (var i=0; i<servings.length; i++) {
				var serving = servings[i];
				if (this.equals(serving.food)) {
					this._servings.push(serving);
				}
			}
		}
		
		this._logReturn("getServings", this._servings);
		return this._servings;
	}
	
	function getRecipe() {
		this._logParams("getRecipe");
		
		if (!this._recipe) {
			var recipes = RecipeCollection.get();
			for (var i=0; i<recipes.length; i++) {
				var recipe = recipes[i];
				if (this.equals(recipe.food)) {
					this._recipe = recipe;
					break;
				}
			}
		}
		
		this._logReturn("getRecipe", this._recipe);
		return this._recipe;
	}
	
	function toString() {
		var foodName = "";
		if (this.brand) {
			foodName = this.brand + ": ";
		}
		foodName += this.name;
		return foodName;
	}

})();

var FoodCollection = (function FoodCollection() {

	return mergeMaps(
		new DataCollection("Food", Food),
		{
			constructor : FoodCollection,
			add 		: add,
		}
	);

	/* 
	 * Parameter values is a map
	 * {
	 * 	"Name" 				 : string name of the food
	 * 	"Brand" 			 : optional, string brand name of the food
	 * 	"Weight (grams)" 	 : optional, weight of the food in grams
	 * 	"Volume (cups)"  	 : optional, volume of the food in cups
	 * 	"Volume (tsp)"   	 : optional, volume of the food in tsp
	 * 	"Other Serving Size" : optional, serving size of the food
	 * 	"Other Serving Type" : optional, serving type of the food
	 * 	"Calories"			 : optional, calorie amount of the food
	 * 	"Protein"		     : optional, protein amount of the food
	 * 	"Carbs"				 : optional, carb amount of the food
	 * 	"Fat"				 : optional, fat amount of the food
	 * }
	*/
    function add(values) {
    	this._logParams("add", values);
    	var food = this._add(values);
    	this._logReturn("add", food);
    	return food;
    }

})();

// SERVING
 
var Serving = function Serving(entry) {
	this._init(entry, true);
	this._addProperties({
		"Food"        : { DataType : Food },
		"For Recipes" : { type : Data.PROPERTY_TYPES.CUSTOM }
	});
}
Serving.prototype = (function() {

	return mergeMaps(
		new FoodData(),
		{ 
			constructor    : Serving,
			_getForRecipes : getForRecipes,
			toString 	   : toString
		}
	);
	
	function getForRecipes() {
		this._logParams("getForRecipes");
		
		if (!this._forRecipes) {
			this._forRecipes = [];
			var recipes = RecipeCollection.get();
			for (var i=0; i<recipes; i++) {
				var recipe = recipes[i];
				for (var j=0; j<recipe.ingredients.length; j++) {
					var ingredient = recipe.ingredients[j];
					if (this.equals(ingredient)) {
						this._forRecipes.push(recipe);
					}
				}
			}
		}
		
		this._logReturn("getForRecipes", this._forRecipes);
		return this._forRecipes;
	}
	
	function toString() {
		var servingName = this.food.toString();
		if (this.grams) {
			servingName += " (" + this.grams + ") grams";
		}
		if (this.cups && this.cups >= Food.CUP_MIN) {
			servingName += " (" + this.cups  + ") cups";
		}
		if (this.tsp && this.tsp < Food.TSP_MAX) {
			servingName += " (" + this.tsp   + ") tsp";
		}
		return servingName;
	}

})();

var ServingCollection = (function ServingCollection() {

	return mergeMaps(
		new DataCollection("Servings", Serving),
		{
			constructor : ServingCollection,
			add 		: add,
		}
	);

	/* 
	 * Parameter values is a map
	 * {
	 * 	"Food" 			     : Food object of this serving
	 * 	"Weight (grams)" 	 : optional, weight of the food in grams
	 * 	"Volume (cups)"  	 : optional, volume of the food in cups
	 * 	"Volume (tsp)"   	 : optional, volume of the food in tsp
	 * 	"Other Serving Size" : optional, serving size of the food
	 * 	"Other Serving Type" : optional, serving type of the food
	 * }
	*/
    function add(values) {
    	this._logParams("add", values);
    	var serving = this._add(values);
    	this._logReturn("add", food);
    	return serving;
    }

})();

// RECIPE
 
var Recipe = function Recipe(entry) {
	this._init(entry, true);
	this._addProperties({
		"Name" 				   : {},
		"Source" 			   : {},
		"Ingredients" 		   : { 
			DataType     : Serving, 
			isManyToMany : true  
		},
		"Notes"		  		   : {},
		"Number of Servings"   : {},
		"Calories Per Serving" : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Protein Per Serving"  : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Carbs Per Serving"    : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Fat Per Serving"      : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Grams Per Serving"    : {
			type : Data.PROPERTY_TYPES.CUSTOM
		},
		"Cups Per Serving"     : {
			type : Data.PROPERTY_TYPES.CUSTOM
		},
		"Tsp Per Serving"      : {
			type : Data.PROPERTY_TYPES.CUSTOM
		},
		"Food"                 : {
			DataType : Food,
		}
	});
}
Recipe.prototype = (function() {

	return mergeMaps(
		new FoodData(),
		{ 
			constructor 		: Recipe,
			_getGramsPerServing : getGramsPerServing,
			_getCupsPerServing  : getCupsPerServing,
			_getTspPerServing 	: getTspPerServing,
			createFood  		: createFood,
			update	    		: update,
			_updateFood 		: updateFood,
		}
	);

	function getGramsPerServing() {
		this._logParams("getGramsPerServing");

		if (!this._gramsPerServing) {
			this._gramsPerServing = 
				this.numberOfServings ? 
				this.grams / this.numberOfServings :
				this.grams;
		}

		this._logReturn("getGramsPerServing", this._gramsPerServing);
		return this._gramsPerServing;
	}

	function getCupsPerServing() {
		this._logParams("getCupsPerServing");

		if (!this._cupsPerServing) {
			this._cupsPerServing = 
				this.numberOfServings ? 
				this.cups / this.numberOfServings :
				this.cups;
		}

		this._logReturn("getCupsPerServing", this._cupsPerServing);
		return this._cupsPerServing;
	}

	function getTspPerServing() {
		this._logParams("getTspPerServing");

		if (!this._tspPerServing) {
			this._tspPerServing = 
				this.numberOfServings ? 
				this.tsp / this.numberOfServings :
				this.tsp;
		}

		this._logReturn("getTspPerServing", this._tspPerServing);
		return this._tspPerServing;
	}

	function createFood() {
		this._logParams("createFood");
		
		this._recalc();

		this.food = FoodCollection.add({
			"Name" 				 : this.name,
			"Brand"				 : "Custom Recipe",
			"Weight (grams)" 	 : this.gramsPerServing,
			"Volume (cups)"  	 : this.cupsPerServing,
			"Volume (tsp)"	 	 : this.tspPerServing,
			"Other Serving Size" : this.otherServingSize,
			"Other Serving Type" : this.otherServingType,
			"Calories"			 : this.caloriesPerServing,
			"Protein"			 : this.proteinPerServing,
			"Carbs"				 : this.carbsPerServing,
			"Fat"				 : this.fatPerServing,
		});

		this._logReturn("createFood", this.food);
		return this.food;
	}

	function update() {
		this._logParams("update");
		this._updateVolume();
		this._updateFood();
		this._logReturn("update");
	}

	function updateFood() {
		this._logParams("updateFood");
		
		if (this.food) {
			this.food.name			   = this.name;
			this.food.grams			   = this.gramsPerServing;
			this.food.cups			   = this.cupsPerServing;
			this.food.tsp			   = this.tspPerServing;
			this.food.otherServingSize = this.otherServingSize;
			this.food.otherServingType = this.otherServingType;
			this.food.calories		   = this.caloriesPerServing;
			this.food.protein 		   = this.proteinPerServing;
			this.food.carbs 		   = this.carbsPerServing;
			this.food.fat 			   = this.fatPerServing;
		}

		this._logReturn("updateFood", this._food);
		return this._food;
	}

})();

var RecipeCollection = (function RecipeCollection() {

	return mergeMaps(
		new DataCollection("Recipe", Recipe),
		{
			constructor : RecipeCollection,
			add 		: add,
		}
	);

	/* 
	 * Parameter values is a map
	 * {
	 * 	"Name" 			     : name of this recipe
	 * 	"Source"			 : optional, URL of the recipe
	 * 	"Ingredients"		 : list of Food ingredients to make the
	 * 						   recipe
	 *  "Notes"				 : optional text notes for the recipe
	 * 	"Weight (grams)" 	 : optional, weight of the cooked recipe
	 * 						   in grams
	 * 	"Volume (cups)"  	 : optional, volume of the cooked recipe
	 * 						   in cups
	 * 	"Volume (tsp)"   	 : optional, volume of the cooked recipe
	 * 						   in tsp
	 * 	"Other Serving Size" : optional, serving size of the cooked 
	 * 						   recipe
	 * 	"Other Serving Type" : optional, serving type of the cooked
	 * 						   recipe
	 *  "Number of Servings" : optional number of servings the recipe
	 *  					   makes
	 * }
	*/
    function add(values) {
    	this._logParams("add", values);

    	// set defaults
    	if (!values["Ingredients"]) {
    		values["Ingredients"] = [];
    	}

    	var recipe = this._add(values);

    	this._logReturn("add", recipe);
    	return recipe;
    }

})();