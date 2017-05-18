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

	function init(entry) {
		this._initData(entry);
		this._addProperties({
			"Weight (grams)" 	 : { variable : "weight" },
			"Volume (cups)"  	 : { variable : "volumeCups" },
			"Volume (tsp)"	 	 : { variable : "volumeTsp" },
			"Other Serving Size" : {},
			"Other Serving Type" : {},
		});
	}

	function update() {
		this._logParams("update");
		this._updateVolume();
		this._logReturn("update");
	}

	function updateVolume() {
		if ( this.volumeCups && 
			(this.volumeCups >= Food.CUP_MIN || !this.volumeTsp)
		) {
			this.volumeTsp = this.volumeCups * Food.TSP_IN_CUP;
		}

		else if ( this.volumeTsp &&
				 (this.volumeTsp < Food.TSP_MAX || !this.volumeCup)
		) {
			this.volumeCups = this.volumeTsp / Food.TSP_IN_CUP;
		}
	}
})();

// FOOD
 
var Food = function Food(entry) {
	this._init(entry);
	this._addProperties({
		"Name" 				 : {},
		"Brand" 			 : {},
		"Calories"			 : {},
		"Protein"			 : {},
		"Carbs"				 : {},
		"Fat"				 : {},
		//todo "Recipe"			 : { DataType : Recipe },
	});
}
Food.TSP_IN_CUP = 48;
Food.CUP_MIN = 0.25;
Food.TSP_MAX = Food.CUP_MIN * Food.TSP_IN_CUP;
Food.prototype = (function() {

	return mergeMaps(
		new FoodData(),
		{ constructor : Food }
	);

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
	 * 	"Recipe"			 : optional, Recipe object that creates
	 * 						   this food
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
	this._init(entry);
	this._addProperties({
		"Food" 				 : { DataType : Food },
		"Calories"			 : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Protein"			 : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Carbs"				 : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Fat"				 : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
	});
}
Serving.prototype = (function() {

	return mergeMaps(
		new FoodData(),
		{ constructor : Serving }
	);

})();

var ServingCollection = (function ServingCollection() {

	return mergeMaps(
		new DataCollection("Serving", Serving),
		{
			constructor : ServingCollection,
			add 		: add,
		}
	);

	/* 
	 * Parameter values is a map
	 * {
	 * 	"Food" 			     : optional, Food object of this serving
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