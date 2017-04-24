function Monster(monsterEntry) {
	this.monsterEntry = monsterEntry;
}

Monster.prototype.getPrimaryElement = function() {
	if (!this.primaryElement) {
		this.primaryElement = 
			this.monsterEntry.field("Primary Element");
	}
	return this.primaryElement;
}

Monster.prototype.getSecondaryElement = function() {
	if (!this.secondaryElement) {
		this.secondaryElement = 
			this.monsterEntry.field("Secondary Element");
	}
	return this.secondaryElement;
}

function Drop(dropEntry) {
	this.dropEntry = dropEntry;
}

Drop.prototype.getMonster = function() {
	if (!this.monster) {
		this.monster = 
			new Monster(this.dropEntry.field("Monster")[0]);
	}
	return this.monster;
}

Drop.prototype.setPrimaryElement = function(primaryElement) {
	this.dropEntry.set("Primary Element", primaryElement);
}

Drop.prototype.setSecondaryElement = function(secondaryElement) {
	this.dropEntry.set("Secondary Element", secondaryElement);
}

Drop.prototype.updateElements = function() {
	var monster = this.getMonster();
	this.setPrimaryElement(monster.getPrimaryElement());
	this.setSecondaryElement(monster.getSecondaryElement());
}