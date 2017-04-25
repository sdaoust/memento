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
	this._entry.set(fieldName, fieldValue);
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
Library.prototype.setName(name) {
	this._set("Name", name);
}

// SKILL 

function Skill(entry) {
	this.init(entry);
}

Skill.prototype = new Library();

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
	return this.get("Next Evo Monsters", Monster);
}
Monster.prototype.setNextEvoMonsters = function(monsters) {
	return this._set("Next Evo Monsters", monsters, Monster);
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

Dungeon.prototype.getIsAvailable = function() {
	return this._get("Available");
}
Dungeon.prototype.setIsAvailable = function(isAvailable) {
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

Floor.prototype.getIsCleared = function() {
	return this._get("Cleared");
}
Floor.prototype.setIsCleared = function(isCleared) {
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

Drop.prototype.getSecondaryElement = function() {
	return this._get("Secondary Element");
}
Drop.prototype.setSecondaryElement = function(element) {
	return this._set("Secondary Element", element);
}

Drop.prototype.updateElements = function() {
	var monster = this.getMonster();
	this.setPrimaryElement(monster.getPrimaryElement());
	this.setSecondaryElement(monster.getSecondaryElement());
}