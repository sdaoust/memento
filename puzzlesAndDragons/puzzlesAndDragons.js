// LIBRARY

function Library() {}

Library.prototype.init = function(entry) {
	this._entry = entry;
}

Library.prototype._get = function(
	fieldName, LibraryName, isManyToMany
) {
	var thisFieldName = 
		this._convertToPrivateLowerCamelCase(fieldName);
	if (!this[thisFieldName]) {
		
		// get the value of the field
		var fieldValue = this._entry.field(fieldName);

		// but, if the value is a list of entries,
		// recalculate the field value to return
		if (LibraryName) {
			var fieldEntries = fieldValue;
			
			// if this is a many to many relationship,
			// the field value will be a list
			if (isManyToMany) {
				fieldValue = [];
				for (var i=0; i<fieldEntries.length; i++) {
					fieldValue.push(new LibraryName(fieldEntries[i]));
				}
			} 
			
			// otherwise, if this is a one to many relationship,
			// the field value will be a single object
			else {
				fieldValue = undefined;
				if (fieldEntries.length == 1) {
					fieldValue = new LibraryName(fieldEntries[0]);
				}
			}
		}
		
		this[thisFieldName] = fieldValue;
	}
	return this[thisFieldName];
}

Library.prototype._set = function(
	fieldName, fieldValue, LibraryName, isManyToMany
) {
	// think of fieldValue as either
	// 1) the string, number, boolean, or list of primitives
	// 2) library object
	// 3) list of library objects
	if (LibraryName && fieldValue) {
		if (isManyToMany) {
			var libraryObjects = fieldValue;
			fieldValue = [];
			for (var i=0; i<libraryObjects.length; i++) {
				var libraryObject = libraryObjects[i];
				fieldValue.push(libraryObject.getEntry());
			}
		} else {
			fieldValue = fieldValue.getEntry();
		}
	}
	this.getEntry().set(fieldName, fieldValue);
	return this._get(fieldName, LibraryName, isManyToMany);
}
	
	// convert string to its lower camel case private form
	// example: "Field Name" -> "_fieldName"
Library.prototype._convertToPrivateLowerCamelCase = function(name) {
	return "_" + 
	name[0].toLowerCase() + 
	name.slice(1).replace(" ", "");
}
	
Library.prototype.getEntry = function() {
	return this._entry;
}
	
Library.prototype.getName = function() {
	return this._get("Name");
}    
Library.prototype.setName = function(name) {
	this._set("Name", name);
}

Library.prototype.toString = function() {
	return this.getName();
}

Library.prototype.logParams = function(methodName, parameters) {
	var logHeader = this._getLogHeader(methodName);

	var parametersString = "{}";
	if (parameters && Object.keys(parameters).length) {
		var parametersList = [];
		for (var key in parameters) {
			var parameter = parameters[key];
			parametersList.push(key + "=" + parameter);
		}
		parametersString = "{ " + parametersList.join(", ") + " }";
	}

	log(logHeader + ": " + parametersString);
}

Library.prototype.logReturn = function(methodName, returnValue) {
	var logHeader = this._getLogHeader(methodName);
	log(logHeader + ".return: " + returnValue);
}

Library.prototype._getLogHeader = function(methodName) {
	var libraryName = this.constructor.name;
	return libraryName + "." + this + "." + methodName;
}

// SKILL 

function Skill(entry) {
	this.init(entry);
}

Skill.prototype = new Library();
Skill.prototype.constructor = Skill;

Skill.prototype.isEqualTo = function(otherSkill) {
	this.logParams("isEqualTo", { otherSkill : otherSkill });
	this.logReturn(
		"isEqualTo", 
		otherSkill && this.getName() == otherSkill.getName()
	);
	return otherSkill && this.getName() == otherSkill.getName();
}

Skill.prototype.isEqualToOrBetterThan = function(otherSkill) {
	this.logParams(
		"isEqualToOrBetterThan", { otherSkill : otherSkill }
	);
	this.logReturn(
		"isEqualToOrBetterThan", 
		!otherSkill || this.isEqualTo(otherSkill)
	);
	return !otherSkill || this.isEqualTo(otherSkill);
}

// MONSTER

function Monster(entry) {
	this.init(entry);
}

Monster.prototype = new Library();

Monster.prototype.getNumber = function() {
	return this._get("Number");
}
Monster.prototype.setNumber = function(number) {
	return this._set("Number", number);
}
	
Monster.prototype.getPrimaryElement = function() {
	return this._get("Primary Element");
}
Monster.prototype.setPrimaryElement = function(element) {
	return this._set("Primary Element", element);
}

Monster.prototype.getSecondaryElement = function() {
	return this._get("Secondary Element");
}
Monster.prototype.setSecondaryElement = function(element) {
	return this._set("Secondary Element", element);
}

Monster.prototype.getSkill = function() {
	return this._get("Skill", Skill);
}
Monster.prototype.setSkill = function(skill) {
	return this._set("Skill", skill, Skill);
}

Monster.prototype.getNextEvoMonsters = function() {
	return this._get("Next Evo Monsters", Monster, true);
}
Monster.prototype.setNextEvoMonsters = function(monsters) {
	return this._set("Next Evo Monsters", monsters, Monster);
}

Monster.prototype.getMaxEvoMonsters = function() {
	if (!this._maxEvoMonsters) {
		this._maxEvoMonsters = [];
		var nextEvoMonsters = this.getNextEvoMonsters();
		switch (nextEvoMonsters.length) {
			case 0:
				this._maxEvoMonsters.push(this);
				break;
			default:
				for (var i=0; i<nextEvoMonsters.length; i++) {
					var nextEvoMonster = nextEvoMonsters[i];
					this._maxEvoMonsters = this._maxEvoMonsters.concat(nextEvoMonster.getMaxEvoMonsters());
				}
				break;
		}
	}
	return this._maxEvoMonsters;
}

Monster.prototype.hasSameSkillAs = function(otherMonster) {
	var skill      = this.getSkill();
	var otherSkill = otherMonster.getSkill();
	return (!skill && !otherSkill) || (skill && skill.isEqualTo(otherSkill));
}

Monster.prototype.hasSameOrBetterSkillThan = function(otherMonster) {
	var skill      = this.getSkill();
	var otherSkill = otherMonster.getSkill();
	return !otherSkill || (skill && skill.isEqualToOrBetterThan(otherSkill));
}

Monster.prototype.evolvesInto = function(evoMonster) {
	if (this.getName() == evoMonster.getName()) {
		return true;
	}
	var nextEvoMonsters      = this.getNextEvoMonsters();
	var isEvolutionPathValid = false;
	for (var i=0; i<nextEvoMonsters.length; i++) {
		var nextEvoMonster   = nextEvoMonsters[i];
		isEvolutionPathValid = nextEvoMonster.evolvesInto(evoMonster);
		if (isEvolutionPathValid) {
			break;
		}
	}
	return isEvolutionPathValid;
}
	
// DUNGEON 

function Dungeon(entry) {
	this.init(entry);
}

Dungeon.prototype = new Library();

Dungeon.prototype.getType = function() {
	return this._get("Type");
}
Dungeon.prototype.setType = function(type) {
	return this._set("Type", type);
}

Dungeon.prototype.isAvailable = function() {
	return this._get("Available");
}
Dungeon.prototype.setAvailable = function(isAvailable) {
	return this._set("Available", isAvailable);
}

// FLOOR

function Floor(entry) {
	this.init(entry);
}

Floor.prototype = new Library();

Floor.prototype.getDungeon = function() {
	return this._get("Dungeon", Dungeon);
}
Floor.prototype.setDungeon = function(dungeon) {
	return this._set("Dungeon", dungeon, Dungeon);
}

Floor.prototype.isCleared = function() {
	return this._get("Cleared");
}
Floor.prototype.setCleared = function(isCleared) {
	return this._set("Cleared", isCleared);
}


// DROP

function Drop(entry) {
	this.init(entry);
}

Drop.prototype = new Library();
	
Drop.prototype.getFloor = function() {
	return this._get("Floor", Floor);
}
Drop.prototype.setFloor = function(floor) {
	return this._set("Floor", floor, Floor);
}

Drop.prototype.getMonster = function() {
	return this._get("Monster", Monster);            
}
Drop.prototype.setMonster = function(monster) {
	return this._set("Monster", monster, Monster);            
}

Drop.prototype.getTypes = function() {
	return this._get("Type");
}
Drop.prototype.setTypes = function(types) {
	return this._get("Type", types);
}

Drop.prototype.getRate = function() {
	return this._get("Rate");
}
Drop.prototype.setRate = function(rate) {
	return this._set("Rate", rate);
}

Drop.prototype.getPrimaryElement = function() {
	return this._get("Primary Element");
}
Drop.prototype.setPrimaryElement = function(element) {
	return this._set("Primary Element", element);
}

Drop.prototype.update = function() {

	// update primary element
	this.setPrimaryElement(this._get("Primary Element Calculation"));

}

// MONSTER BOX

function BoxedMonster(entry) {
	this.init(entry);
}

BoxedMonster.prototype = new Library();

BoxedMonster.prototype.setName = undefined;

BoxedMonster.prototype.getMonster = function() {
	return this._get("Monster", Monster);            
}
BoxedMonster.prototype.setMonster = function(monster) {
	return this._set("Monster", monster, Monster);            
}

BoxedMonster.prototype.getMaxEvoMonster = function() {
	return this._get("Max Evo Monster", Monster);            
}
BoxedMonster.prototype.setMaxEvoMonster = function(monster) {
	return this._set("Max Evo Monster", monster, Monster);            
}
BoxedMonster.prototype.updateMaxEvoMonster = function() {
	// update max evolution if one is not set yet, 
	// and if there's only one max evolution 
	// and it has the same or better skill as this monster
	var maxEvoMonster = this.getMaxEvoMonster();
	var monster       = this.getMonster();
	if (!maxEvoMonster) {
		var maxEvoMonsters = monster.getMaxEvoMonsters();
		if (maxEvoMonsters.length == 1) {
			var possibleMaxEvoMonster = maxEvoMonsters[0];
			if (possibleMaxEvoMonster.hasSameSkillAs(monster)) {
				maxEvoMonster = possibleMaxEvoMonster;
			} else if (possibleMaxEvoMonster.hasSameOrBetterSkillThan(monster)) {
				// do any monsters in between this boxed monster and its max evo have a different skill?
				// if so, then this max evo monster doesn't count
				var pathToMaxEvoMonsterYieldsManySkills = false;
				var nextEvoMonsters = monster.getNextEvoMonsters();
				while (nextEvoMonsters.length == 1) {
					var nextEvoMonster = nextEvoMonsters[0];
					if (!possibleMaxEvoMonster.hasSameOrBetterSkillThan(nextEvoMonster)) {
						pathToMaxEvoMonsterYieldsManySkills = true;
						break;
					}
					nextEvoMonsters = nextEvoMonster.getNextEvoMonsters();
				}
				if (!pathToMaxEvoMonsterYieldsManySkills) {
					maxEvoMonster = possibleMaxEvoMonster;
				}
			}
			if (maxEvoMonster) {
				this.setMaxEvoMonster(maxEvoMonster);
			}
		}
	}
}

BoxedMonster.prototype.getNextEvoMonster = function() {
	return this._get("Next Evo Monster", Monster);            
}
BoxedMonster.prototype.setNextEvoMonster = function(monster) {
	return this._set("Next Evo Monster", monster, Monster);            
}
BoxedMonster.prototype.updateNextEvoMonster = function() {
	var monster        = this.getMonster();
	var nextEvoMonster = undefined;
	if(!this.isMaxEvolved()) {
		var nextEvoMonsters = monster.getNextEvoMonsters();
		var maxEvoMonster = this.getMaxEvoMonster();
		if (nextEvoMonsters.length == 1) {
			var possibleNextEvoMonster = nextEvoMonsters[0];
			if (maxEvoMonster) {
				nextEvoMonster = possibleNextEvoMonster;
			}
			else if (possibleNextEvoMonster.hasSameOrBetterSkillThan(monster)) {
				nextEvoMonster = possibleNextEvoMonster;
			}
		} else if (nextEvoMonsters.length > 1 && maxEvoMonster) {
			// find the next evo that leads to max evo
			for (var i=0; i<nextEvoMonsters.length; i++) {
				var possibleNextEvoMonster = nextEvoMonsters[i];
				if (possibleNextEvoMonster.evolvesInto(maxEvoMonster)) {
					nextEvoMonster = possibleNextEvoMonster;
					break;
				}
			}
		}
	}
	this.setNextEvoMonster(nextEvoMonster);
}

BoxedMonster.prototype.isMaxEvolved = function() {
	return this._get("Max Evolved");            
}
BoxedMonster.prototype.setMaxEvolved = function(isMaxEvolved) {
	return this._set("Max Evolved", isMaxEvolved);            
}
BoxedMonster.prototype.updateMaxEvolved = function() {
	var maxEvoMonster = this.getMaxEvoMonster();
	this.setMaxEvolved(maxEvoMonster && this.getMonster().getName() == maxEvoMonster.getName());
}

BoxedMonster.prototype.isSkillFinal = function() {
	return this._get("Has Final Skill");            
}
BoxedMonster.prototype.setSkillFinal = function(isSkillFinal) {
	return this._set("Has Final Skill", isSkillFinal);            
}
BoxedMonster.prototype.updateSkillFinal = function() {
	var isSkillFinal  = false;
	var maxEvoMonster = this.getMaxEvoMonster();
	if (this.isMaxEvolved()) {
		isSkillFinal = true;
	} else if (maxEvoMonster) {
		isSkillFinal = this.getMonster().hasSameSkillAs(maxEvoMonster);
	}
	this.setSkillFinal(isSkillFinal);
}

BoxedMonster.prototype.isSkillMaxed = function() {
	return this._get("Maxed Skill");            
}
BoxedMonster.prototype.setSkillMaxed = function(isSkillMaxed) {
	return this._set("Maxed Skill", isSkillMaxed);            
}
BoxedMonster.prototype.updateSkillMaxed = function() {
	var isSkillMaxed = this.isSkillMaxed();
	if (!isSkillMaxed && this.isSkillFinal() && !this.getMonster().getSkill()) {
		isSkillMaxed = true;
		this.setSkillMaxed(isSkillMaxed);
	}
}

BoxedMonster.prototype.getPrimaryElement = function() {
	return this._get("Primary Element");
}
BoxedMonster.prototype.setPrimaryElement = function(element) {
	return this._set("Primary Element", element);
}
BoxedMonster.prototype.updatePrimaryElement = function() {
	this.setPrimaryElement(this._get("Primary Element Calculation"));
}

BoxedMonster.prototype.update = function() {
	this.updatePrimaryElement();
	this.updateMaxEvoMonster();
	this.updateMaxEvolved();
	this.updateNextEvoMonster();
	this.updateSkillFinal();
	this.updateSkillMaxed();
}

BoxedMonster.prototype.evolve = function() {
	if (this.isMaxEvolved()) {
		message("This monster is already max evolved");
	} else {
		var nextEvoMonster = this.getNextEvoMonster();
		if (!nextEvoMonster) {
			// there is no set next evo,
			// but it is possible this monster has only one next evo
			// if that next evo as a different skill
			// let's check
			var nextEvoMonsters = this.getMonster().getNextEvoMonsters();
			if (nextEvoMonsters.length == 1) {
				nextEvoMonster = nextEvoMonsters[0];
			}
		}
		if (nextEvoMonster) {
			this.setMonster(nextEvoMonster);
			this.updatePrimaryElement();
			this.updateMaxEvolved();
			this.updateNextEvoMonster();
			this.updateSkillFinal();
		} else {
			message("This monster does not have a known next evolution");
		}
	}
}