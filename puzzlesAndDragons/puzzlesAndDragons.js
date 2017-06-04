// SKILL 

var Skill = function Skill(entry) {
	this._init(entry);
	this._addProperties({
		"Name" : {}
	});
};
Skill.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{
			constructor		   : Skill,
			equalsOrBetterThan : equalsOrBetterThan
		}
	);

	function equalsOrBetterThan(otherSkill) {
		this._logParams(
			"equalsOrBetterThan", { otherSkill : otherSkill }
		);
		this._logReturn(
			"equalsOrBetterThan", 
			!otherSkill || this.equals(otherSkill)
		);
		return !otherSkill || this.equals(otherSkill);
	}

})();

var SkillCollection = (function SkillCollection() {
    
    return mergeMaps(
		new DataCollection("Skills", Skill),
		{ 
			constructor : SkillCollection,
			add         : add 
		}
	);

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Name" : string name of the skill
	 * }
	*/
    function add(values) {
    	this._logParams("add", values);
    	var skill = this._add(values);
    	this._logReturn("add", skill);
    	return skill;
    }

})();

// MONSTER

var Monster = function Monster(entry) {
	this._init(entry);
	this._addProperties({
		"Name" 				: {},
		"Number" 			: {},
		"Primary Element"	: {},
		"Secondary Element" : {},
		"Skill" 		    : { 
			DataType : Skill 
		},
		"Next Evo Monsters" : { 
			DataType     : Monster, 
			isManyToMany : true 
		},
		"Max Evo Monsters"  : {
			type : Data.PROPERTY_TYPES.CUSTOM
		}
	});
};
Monster.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{
			constructor 	   	   : Monster,
			hasSameSkillAs    	   : hasSameSkillAs,
			hasSameOrBetterSkillAs : hasSameOrBetterSkillAs,
			evolvesInto			   : evolvesInto,
			_getMaxEvoMonsters 	   : getMaxEvoMonsters,
		}
	);

	function hasSameSkillAs(otherMonster) {
		this._logParams(
			"hasSameSkillAs", { otherMonster : otherMonster }
		);
		var hasSameSkill =
			( !this.skill && !otherMonster.skill ) || 
			( this.skill && this.skill.equals(otherMonster.skill) );
		this._logReturn("hasSameSkillAs", hasSameSkill);
		return hasSameSkill;
	}

	function hasSameOrBetterSkillAs(otherMonster) {
		this._logParams(
			"hasSameOrBetterSkillAs", { otherMonster : otherMonster }
		);
		var hasSameOrBetterSkill =
			( !otherMonster.skill ) || 
			( this.skill && 
			  this.skill.equalsOrBetterThan(otherMonster.skill) );
		this._logReturn(
			"hasSameOrBetterSkillAs", hasSameOrBetterSkill
		);
		return hasSameOrBetterSkill;
	}

	function evolvesInto(monster) {
		this._logParams("evolvesInto", { monster : monster });

		var isEvolutionPathValid = false;

		if (this.equals(monster)) {
			isEvolutionPathValid = true;
		} else {
			for (var i=0; i<this.nextEvoMonsters.length; i++) {
				var nextEvoMonster   = this.nextEvoMonsters[i];
				if (nextEvoMonster.evolvesInto(monster)) {
					isEvolutionPathValid = true;
					break;
				}
			}
		}

		this._logReturn("evolvesInto", isEvolutionPathValid);
		return isEvolutionPathValid;
	}

	function getMaxEvoMonsters() {
		this._logParams("getMaxEvoMonsters");
		if (!this._maxEvoMonsters) {
			this._maxEvoMonsters = [];
			switch (this.nextEvoMonsters.length) {
				case 0:
					this._maxEvoMonsters.push(this);
					break;
				default:
					for (var i=0; i<this.nextEvoMonsters.length; i++)
					{
						var nextEvoMonster = this.nextEvoMonsters[i];
						this._maxEvoMonsters = 
							this._maxEvoMonsters.concat(
								nextEvoMonster.maxEvoMonsters
							);
					}
					break;
			}
		}
		this._logReturn("getMaxEvoMonsters", this._maxEvoMonsters);
		return this._maxEvoMonsters;
	}

})();

var MonsterCollection = (function MonsterCollection() {
    
    return mergeMaps(
		new DataCollection("Monsters", Monster),
		{ 
			constructor : MonsterCollection,
			add         : add 
		}
	);

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Name" 				: string name of the monster
	 * 	"Number"			: integer number of the monster
	 * 	"Primary Element"   : string element of the monster, must be
	 * 						  one of "Fire", "Water", "Wood", "Light",
	 * 						  or "Dark"
	 * 	"Secondary Element" : optional, string element of the monster, 
	 * 						  must be one of "Fire", "Water", "Wood", 
	 * 						  "Light", or "Dark"
	 * 	"Skill"				: optional, Skill object of this monster
	 * 	"Next Evo Monsters" : optional, list of Monster objects that
	 * 						  this monster can evolve directly into
	 * }
	*/
    function add(values) {
    	this._logParams("add", { values : values });

    	// set defaults
    	if (!values["Next Evo Monsters"]) {
    		values["Next Evo Monsters"] = [];
    	}

    	var monster = this._add(values);
    	this._logReturn("add", monster);
    	return monster;
    }

})();
	
// DUNGEON 

var Dungeon = function Dungeon(entry) {
	this._init(entry);
	this._addProperties({
		"Name"      : {},
		"Type" 		: {},
		"Order"		: {},
		"Available" : { variable : "isAvailable" },
		"Cleared"   : { variable : "isCleared" },
		"Floors"    : { type     : Data.PROPERTY_TYPES.CUSTOM },
	});
};
Dungeon.TYPES = {
	NORMAL    : "Normal",
	TECHNICAL : "Technical",
	SPECIAL   : "Special"
}
Dungeon.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{ 
			constructor  		 : Dungeon,
			_getFloors   		 : getFloors,
			update		 		 : update,
			_updateFloorsCleared : updateFloorsCleared
		}
	);

	function getFloors() {
		this._logParams("getFloors");

		if (!this._floors) {
			this._floors = [];
			var floors = FloorCollection.get();
			for (var i=0; i<floors.length; i++) {
				var floor = floors[i];
				if (this.equals(floor.dungeon)) {
					this._floors.push(floor);
				}
			}
		}

		this._logReturn("getFloors", this._floors);
		return this._floors;
	}

    function update() {
    	this._logParams("update");

    	this._updateFloorsCleared();

    	if (this.isCleared) {
	    	DungeonCollection.update();
	    }

    	this._logReturn("update");
    }

    // if this dungeon is cleared then so are its floors
    function updateFloorsCleared() {
    	this._logParams("updateFloorsCleared", {});    	

    	if (this.isCleared) {
    		for (var i=0; i<this.floors.length; i++) {
	    		var floor = floors[i];
	    		floor.isCleared = true;
	    	}
    	}

    	this._logReturn("updateFloorsCleared", this.isCleared);
    	return this.isCleared;
    }

})();

var DungeonCollection = (function DungeonCollection() {

	var collectionObject = new DataCollection("Dungeons", Dungeon);
	collectionObject._getCollection = collectionObject.get;
    
    return mergeMaps(
		collectionObject,
		{ 
			constructor 		: DungeonCollection,
			get 				: get,
			add         		: add,
			update 				: update,
			_updateAvailability : updateAvailability
		}
	);

    function get(type) {
    	this._logParams("get", { type : type });

    	var dungeons = [];

    	if (!type) {
    		dungeons = this._getCollection();
    	} 

    	else {
    		if (!this._subcollection) {
    			this._subcollection = {};
    		}
    		if (!this._subcollection[type]) {
				
				this._subcollection[type] = [];

		    	var allDungeons   = this._getCollection();
		    	var orderDungeons = 
		    		type == Dungeon.TYPES.NORMAL || 
		    		type == Dungeon.TYPES.TECHNICAL;

	    		for (var i=0; i<allDungeons.length; i++) {
	    			var dungeon = allDungeons[i];
	    			if (dungeon.type == type) {
	    				if (orderDungeons) {
	    					this._subcollection[type][dungeon.order] =
	    						dungeon;
	    				} else {
	    					this._subcollection[type].push(dungeon);
	    				}
	    			}
	    		}
	    	}
	    	dungeons = this._subcollection[type];
	    }

    	this._logReturn("get", dungeons);
    	return dungeons;
    }

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Name" 		   : string name of the dungeon
	 * 	"Type"		   : string type of the dungeon, must be one of
	 * 					 Dungeon.TYPES
	 * 	"Is Available" : optional, default false, boolean value of 
	 * 					 whether this dungeon is available
	 * }
	*/
    function add(values) {
    	this._logParams("add", { values : values });

    	// set defaults
    	if (!values["Is Available"]) {
    		values["Is Available"] = false;
    	}

    	var dungeon = this._add(values);
    	this._logReturn("add", dungeon);
    	return dungeon;
    }

    // update availability of normal and technical dungeons
    function update() {
    	this._logParams("update");

    	this._updateAvailability(this.get(Dungeon.TYPES.NORMAL));
    	this._updateAvailability(this.get(Dungeon.TYPES.TECHNICAL));

    	this._logReturn("update");
    }

    function updateAvailability(dungeons) {
    	this._logParams(
    		"updateAvailability", { dungeons : dungeons }
    	);

    	// look for the first not available dungeon, and set it to 
    	// available if the previous dungeon has been cleared
    	for (var i=1; i<dungeons.length; i++) {
    		var dungeon = dungeons[i];
    		if (!dungeon.isAvailable) {
    			dungeon.isAvailable = true;
    			break;
    		}
    		if (!dungeon.isCleared) {
    			break;
    		}
    	}

    	this._logReturn("updateAvailability", dungeons);
    	return dungeons;
    }

})();


// FLOOR

var Floor = function Floor(entry) {
	this._init(entry);
	this._addProperties({
		"Name" 		 : {},
		"Dungeon"    : { DataType : Dungeon },
		"Is Cleared" : {},
	});
};
Floor.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{ 
			constructor    		  : Floor,
			update 			      : update,
			_updateDungeonCleared : updateDungeonCleared
		}
	);

	function update() {
    	this._logParams("update");

    	this._updateDungeonCleared();

    	this._logReturn("update");
    }

    // if all floors of this dungeon are cleraed, so is the dungeon
    function updateDungeonCleared() {
    	this._logParams("updateDungeonCleared", {});

		var isDungeonCleared = true;
		for (var i=0; i<this.dungeon.floors.length; i++) {
			var otherFloor = this.dungeon.floors[i];
			if (!otherFloor.isCleared) {
				isDungeonCleared = false;
				break;
			}
		}
		this.dungeon.isCleared = isDungeonCleared;

		if (isDungeonCleared) {
    		DungeonCollection.update();
    	}

    	this._logReturn(
    		"updateDungeonCleared", this.dungeon.isCleared
    	);
    	return this.dungeon.isCleared;
    }

})();

var FloorCollection = (function FloorCollection() {
    
    return mergeMaps(
		new DataCollection("Floors", Floor),
		{ 
			constructor : FloorCollection,
			add         : add 
		}
	);

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Name" 		 : string name of the floor
	 * 	"Dungeon"	 : Dungeon object that this floor is on
	 * 	"Is Cleared" : optional, default false, boolean value of 
	 * 				   whether this dungeon has been cleared
	 * }
	*/
    function add(values) {
    	this._logParams("add", { values : values });

    	// set defaults
    	if (!values["Is Cleared"]) {
    		values["Is Cleared"] = false;
    	}

    	var floor = this._add(values);
    	this._logReturn("add", floor);
    	return floor;
    }

})();


// DROP

var Drop = function Drop(entry) {
	this._init(entry);
	this._addProperties({
		"Location"		   			  : { 
			type : Data.PROPERTY_TYPES.CALCULATION 
		},
		"Floor" 		  			  : { DataType : Floor },
		"Monster"					  : { DataType : Monster },
		"Type"						  : { variable : "types" },
		"Rate"					      : {},
		"Primary Element"			  : {},
		"Primary Element Calculation" : { 
			type : Data.PROPERTY_TYPES.CALCULATION
		}
	});
	
};
Drop.TYPES = {
	RANDOM : "Random",
	MAJOR  : "Major",
	RARE   : "Rare",
	INVADE : "Invade"
}
Drop.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{ 
			constructor 		  : Drop,
			update                : update,
			_updatePrimaryElement : updatePrimaryElement,
			toString              : toString,
		}
	);
	
	function update() {
		this._logParams("update");
		this._updatePrimaryElement();
		this._logReturn("update");
	}

	function updatePrimaryElement() {
		this._logParams("updatePrimaryElement");
		this.primaryElement = this.primaryElementCalculation;
		this._logReturn("updatePrimaryElement", this.primaryElement);
		return this.primaryElement;
	}
	
	function toString() {
		return this.location + ": " + 
			   this.monster  + ": " + 
			   this.types.join(", ");
	}

})();

var DropCollection = (function DropCollection() {
    
    return mergeMaps(
		new DataCollection("Drops", Drop),
		{ 
			constructor : DropCollection,
			add         : add 
		}
	);

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Floor"   : Floor object of this drop
	 * 	"Monster" : Monster object of this drop
	 * 	"Type"    : optional, default "Random", string value of the
	 * 				type of drop, must be one of Drop.TYPES
	 * 	"Rate"	  : optional, integer rate percentage of this drop
	 * }
	*/
    function add(values) {
    	this._logParams("add", { values : values });

    	// set defaults
    	if (!values["Type"]) {
    		values["Type"] = Drop.TYPES.RANDOM;
    	}

    	var drop = this._add(values);
    	this._logReturn("add", drop);
    	return drop;
    }

})();

// MONSTER BOX

var BoxedMonster = function BoxedMonster(entry) {
	this._init(entry);
	this._addProperties({
		"Name"			   			  : { 
			type : Data.PROPERTY_TYPES.CALCULATION
		},
		"Monster"		 			  : { DataType : Monster },
		"Max Evo Monster"			  : { DataType : Monster },
		"Next Evo Monster"			  : { DataType : Monster },
		"Max Evolved"  			  	  : { variable : "isMaxEvolved" },
		"Has Final Skill"			  : { variable : "isSkillFinal" },
		"Maxed Skill" 			  	  : { variable : "isSkillMaxed" },
		"Primary Element"			  : {},
		"Primary Element Calculation" : { 
			type : Data.PROPERTY_TYPES.CALCULATION
		}
	});
};
BoxedMonster.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{ 
			constructor		      : BoxedMonster,
			evolve				  : evolve,
			update                : update,
			_updateMaxEvoMonster  : updateMaxEvoMonster,
			_updateNextEvoMonster : updateNextEvoMonster,
			_updateMaxEvolved     : updateMaxEvolved,
			_updateSkillFinal     : updateSkillFinal,
			_updateSkillMaxed     : updateSkillMaxed,
			_updatePrimaryElement : updatePrimaryElement,
			equals                : undefined,
		}
	);

	function evolve() {
		this._logParams("evolve");

		if (this.isMaxEvolved) {
			message("This monster is already max evolved");
		}
		
		else if (this.nextEvoMonster) {
			this.monster = this.nextEvoMonster;
			this.update();
		}
		
		else {
			// there is no set next evo,
			// but it is possible this monster has only one next evo
			// if that next evo as a different skill
			// let's check
			if (this.monster.nextEvoMonsters.length == 1) {
				var nextEvoMonster = this.monster.nextEvoMonsters[0];
				this.monster = nextEvoMonster;
				this.update();
			} else {
				message(
					"This monster does not have a known next " +
					"evolution"
				);
			}
		}

		this._logReturn("evolve", this.monster);
		return this.monster;
	}
	
	function update() {
		this._logParams("update");
		this._updatePrimaryElement();
		this._updateMaxEvoMonster();
		this._updateMaxEvolved();
		this._updateNextEvoMonster();
		this._updateSkillFinal();
		this._updateSkillMaxed();
		this._entry.recalc();
		this._logReturn("update");
	}

	function updateMaxEvoMonster() {
		// update max evolution if one is not set yet, 
		// if there's only one max evolution ,
		// and the max evolution has the same or better skill
		
		this._logParams("updateMaxEvoMonster");

		if ( !this.maxEvoMonster &&
			 this.monster.maxEvoMonsters.length == 1 ) 
		{
			var possibleMaxEvoMonster = 
				this.monster.maxEvoMonsters[0];

			if (possibleMaxEvoMonster.hasSameSkillAs(this.monster)) {
				this.maxEvoMonster = possibleMaxEvoMonster;
			} 

			else if (
				possibleMaxEvoMonster
					.hasSameOrBetterSkillAs(this.monster)) 
			{
				// possible max evo monster has better skill

				// do any monsters in between this boxed monster and 
				// its max evo have a different skill?
				// if so, then this max evo monster doesn't count
				var evolutionPathHasOtherSkills = false;
				var nextEvoMonsters = this.monster.nextEvoMonsters;
				while (nextEvoMonsters.length == 1) {
					var nextEvoMonster = nextEvoMonsters[0];
					if (!possibleMaxEvoMonster
							.hasSameOrBetterSkillAs(nextEvoMonster)
					) {
						evolutionPathHasOtherSkills = true;
						break;
					}
					nextEvoMonsters = nextEvoMonster.nextEvoMonsters;
				}
				if (!evolutionPathHasOtherSkills) {
					this.maxEvoMonster = possibleMaxEvoMonster;
				}
			}
		}

		this._logReturn("updateMaxEvoMonster", this.maxEvoMonster);
		return this.maxEvoMonster;
	}

	function updateNextEvoMonster() {

		this._logParams("updateNextEvoMonster");

		if (!this.isMaxEvolved && 
			 this.monster.nextEvoMonsters.length == 1 ) 
		{
			var possibleNextEvoMonster = 
				this.monster.nextEvoMonsters[0];
			if (this.maxEvoMonster) {
				this.nextEvoMonster = possibleNextEvoMonster;
			}
			else if (possibleNextEvoMonster
					.hasSameOrBetterSkillAs(this.monster)) 
			{
				this.nextEvoMonster = possibleNextEvoMonster;
			}
		} 

		else if ( this.monster.nextEvoMonsters.length > 1 && 
				  this.maxEvoMonster ) 
		{
			// find the next evo that leads to max evo
			for (var i=0; i<this.monster.nextEvoMonsters.length; i++)
			{
				var possibleNextEvoMonster = 
					this.monster.nextEvoMonsters[i];
				if (possibleNextEvoMonster
					.evolvesInto(this.maxEvoMonster)
				) {
					this.nextEvoMonster = possibleNextEvoMonster;
					break;
				}
			}
		}

		if (this.monster.equals(this.nextEvoMonster)) {
			this.nextEvoMonster = undefined;
		}

		this._logReturn("updateNextEvoMonster", this.nextEvoMonster);
		return this.nextEvoMonster;
	}

	function updateMaxEvolved() {
		this._logParams("updateMaxEvolved");
		this.isMaxEvolved = 
			this.maxEvoMonster && 
			this.monster.equals(this.maxEvoMonster);
		this._logReturn("updateMaxEvolved", this.isMaxEvolved);
		return this.isMaxEvolved;
	}

	function updateSkillFinal() {
		this._logParams("updateSkillFinal");

		if (this.isMaxEvolved) {
			this.isSkillFinal = true;
		} else if (this.maxEvoMonster) {
			this.isSkillFinal = 
				this.monster.hasSameSkillAs(this.maxEvoMonster);
		}

		this._logReturn("updateSkillFinal", this.isSkillFinal);
		return this.isSkillFinal;
	}

	function updateSkillMaxed() {
		this._logParams("updateSkillMaxed");
		if (!this.isSkillFinal) {
			this.isSkillMaxed = false;
		} else if (!this.monster.skill) {
			this.isSkillMaxed = true;
		}
		this._logReturn("updateSkillMaxed", this.isSkillMaxed);
		return this.isSkillMaxed;
	}

	function updatePrimaryElement() {
		this._logParams("updatePrimaryElement");
		this.primaryElement = this.primaryElementCalculation;
		this._logReturn("updatePrimaryElement", this.primaryElement);
		return this.primaryElement;
	}

})();

var BoxedMonsterCollection = (function BoxedMonsterCollection() {
    
    return mergeMaps(
		new DataCollection("Monster Box", BoxedMonster),
		{ 
			constructor : BoxedMonsterCollection,
			add         : add 
		}
	);

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Monster" 		   : Monster object of this boxed monster
	 * 	"Max Evo Monster"  : optional, Monster object that is the max
	 * 					     evolution this boxed monster should 
	 * 					     become
	 * 	"Next Evo Monster" : optional, Monster object that this boxed
	 * 						 monster should evolve directly into next
	 * 	"Max Evolved"	   : optional, default false, boolean value of
	 * 						 whether this boxed monster is finished
	 * 						 evolving
	 * 	"Has Final Skill"  : optional, default false, boolean value of
	 * 						 whether this boxed monster has the same
	 * 						 skill as its set max evolution
	 * 	"Maxed Skill"	   : optional, default false, boolean value of
	 * 						 whether this boxed monster has maxed out
	 * 						 its max evolution skill
	 * }
	*/
    function add(values) {
    	this._logParams("add", { values : values });

    	// set defaults
    	if (values["Max Evolved"] == undefined) {
    		values["Max Evolved"] = false;
    	}
    	if (values["Has Final Skill"] == undefined) {
    		values["Has Final Skill"] = false;
    	}
    	if (values["Maxed Skill"] == undefined) {
    		values["Maxed Skill"] = false;
    	}

    	var boxedMonster = this._add(values);
    	this._logReturn("add", boxedMonster);
    	return boxedMonster;
    }

})();

// FARM MONSTER

var FarmMonster = function FarmMonster(entry) {
	this._init(entry);
	this._addProperties({
		"Location"	   : { type : Data.PROPERTY_TYPES.CALCULATION },
		"Drop"     	   : { DataType : Drop },
		"Drop Monster" : { DataType : Monster },
		"Skill"        : { DataType : Skill },
		"For Monsters" : { 
			DataType     : Monster,
			isManyToMany : true
		},
		"Dungeon"      : { 
			type     : Data.PROPERTY_TYPES.CALCULATION,
			variable : "dungeonName"
		}
	});
};
FarmMonster.prototype = (function () {
	
	return mergeMaps(
		new Data(),
		{ 
			constructor 	   : FarmMonster,
			update			   : update,
			_updateDropMonster : updateDropMonster,
			_updateSkill 	   : updateSkill,
			toString		   : toString,
		}
	);

	function update() {
		this._logParams("update");
		this._updateDropMonster();
		this._updateSkill();
		this._logReturn("update");
	}

	function updateDropMonster() {
		this._logParams("updateDropMonster");
		this.dropMonster = this.drop.monster;
		this._logReturn("updateDropMonster", this.dropMonster);
		return this.dropMonster;
	}

	function updateSkill() {
		this._logParams("updateSkill");
		this.skill = this.dropMonster.skill;
		this._logReturn("updateSkill", this.skill);
		return this.skill;
	}
	
	function toString() {
		return this.drop.monster.toString();
	}
	
})();

var FarmMonsterCollection = (function FarmMonsterCollection() {
    
    return mergeMaps(
		new DataCollection(
			"Farm", FarmMonster
		),
		{ 
			constructor : FarmMonsterCollection,
			add  		: add,
			init 		: init
		}
	);

    /* 
	 * Parameter values is a map
	 * {
	 * 	"Drop"    	   : Drop object of the monster to be farmed
	 * 	"For Monsters" : List of boxed monsters that need their skills
	 * 					 leveled up with the monster to be farmed
	 * }
	*/
    function add(values) {
    	this._logParams("add", { values : values });
    	var farmMonster = this._add(values);

    	// recalc so the memento library can be grouped by calculated
    	// fields such as dungeon
    	farmMonster.recalc();

    	this._logReturn("add", farmMonster);
    	return farmMonster;
    }

    function init() {
    	this._logParams("init");
		
		if (this.get().length) {
			message("Empty this farm library before initializing");
			return;
		}

		// get skills to farm and the list of boxed monsters that need
		// this skill up

		var skillsToFarm  = {};
		var boxedMonsters = BoxedMonsterCollection.get();
		for (var i=0; i<boxedMonsters.length; i++) {
			var boxedMonster = boxedMonsters[i];

			if (  boxedMonster.isSkillFinal && 
				 !boxedMonster.isSkillMaxed && 
				  boxedMonster.monster.skill ) 
			{
				// this boxed monster needs to level up its skill
				if (!(boxedMonster.monster.skill.name in skillsToFarm)
				) {
					skillsToFarm[boxedMonster.monster.skill.name] = 
						[];
				}
				skillsToFarm[boxedMonster.monster.skill.name]
					.push(boxedMonster);
			}
		}

		// find drops that have skill ups our boxed monsters need

		
		var drops = DropCollection.get();
		for (var i=0; i<drops.length; i++) {
			var drop = drops[i];

			if ( drop.floor.dungeon.isAvailable && 
				 drop.monster.skill && 
				 drop.monster.skill.name in skillsToFarm &&
				( drop.floor.dungeon.type != Dungeon.TYPES.NORMAL || 
				  drop.types.indexOf(Drop.TYPES.MAJOR) < 0 ) )
			{
				// this drop is from an available dungeon, 
				// has a skill that a boxed monster needs to skill up,
				// and is not a major drop from a normal dungeon since
				// these are unlikely to drop

				this.add({
					"Drop"         : drop,
					"For Monsters" : 
						skillsToFarm[drop.monster.skill.name]
				});

			}
		}

		this._logReturn("init");
	}

})();