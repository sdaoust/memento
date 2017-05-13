// for some reason the below Object functions aren't defined in 
// memento

// mimic Object.assign
function mergeMaps(map, newProperties) {
	for (var key in newProperties) {
		map[key] = newProperties[key];
	}
	return map;
};

// mimic Object.values
function getMapValues(map) {
	var values = [];
	for (var key in map) {
		values.push(map[key]);
	}
	return values;
}

// helper memento functions

var Logger = (function() {
    
    return {

    	logParams : logParams,
    	logReturn : logReturn

    };

    function logParams(logHeader, methodName, parameters) {

		var parametersString = "{}";
		if (parameters && Object.keys(parameters).length) {
			var parametersList = [];
			for (var key in parameters) {
				var parameter = parameters[key];
				parametersList.push(key + "=" + parameter);
			}
			parametersString = 
				"{ " + parametersList.join(", ") + " }";
		}

		log(logHeader + ": " + parametersString);
	}

	function logReturn(logHeader, methodName, returnValue) {
		log(logHeader + ".return: " + returnValue);
	}

})();

// DATA - wrapper for entry

var Data = function Data() {};
Data.prototype = (function () {

	return {
		update            : update,
		toString 		  : toString,
		equals            : equals,
		_init    		  : init,
		_addProperties	  : addProperties,
		_get	 		  : get,
		_getCalculation   : getCalculation,
		_set	 	 	  : set,
		_toLowerCamelCase : toLowerCamelCase,
		_toUpperCamelCase : toUpperCamelCase,
		_logParams 		  : logParams,
		_logReturn		  : logReturn,
		_getLogHeader	  : getLogHeader
	};

	function init(entry) {
		
		Object.defineProperty(this, "_entry", { 
			get : function() { return entry; },
		});
		
	}

	function update() {} // override in subclass
	
	/*
	 * Parameter properties is a map
	 * {
	 * 	string field name as defined in the library. The lower camel 
	 * 	case form of this name will become the property variable, eg
	 * 	field name "Max Evo Monster" can be accessed by 
	 * 	this.maxEvoMonster :
	 * 		{
	 * 			"variable" : optional, if a different property 
	 * 						 variable name is desired, set this value
	 * 			"type"     : optional, string can be either
	 * 					     CALCULATION, CUSTOM, or DEFAULT. If no or
	 * 					     unknown value is given, DEFAULT will be 
	 * 					     used. CALCULATION is needed for library
	 * 					     calculation fields. CUSTOM is needed for
	 * 					     fields that are not defined in the
	 * 					     library and only used by the code base.
	 * 		}
	 * }
	 * Eac
	 */
	function addProperties(properties) {
		
		for (var propertyName in properties) {
			var property = properties[propertyName];
			
			// wrap in function so that property in the get/set 
			// functions is always in scope
			(function(dataObject, property, propertyName) {
				
				if (!property.variable) {
					property.variable = 
						dataObject._toLowerCamelCase(propertyName);
				}
				
				if (!property.type || getMapValues(Data.PROPERTY_TYPES).indexOf(property.type) < 0) {
					property.type = Data.PROPERTY_TYPES.DEFAULT;
				}
				
				var getFunction = undefined;
				var setFunction = undefined;

				
				switch(property.type) {

					case Data.PROPERTY_TYPES.CALCULATION :
						getFunction = function() {
							return dataObject
								._getCalculation(propertyName);
						};
						break;

					case Data.PROPERTY_TYPES.CUSTOM :
						var getFunctionName = 
							"_get" + 
							dataObject
								._toUpperCamelCase(propertyName);
						getFunction = dataObject[getFunctionName];
						break;

					case Data.PROPERTY_TYPES.DEFAULT :
						getFunction = function() {
							return dataObject._get({
								name		 : propertyName,
								DataType     : property.DataType,
								isManyToMany : property.isManyToMany
							});
						}
						setFunction = function(newValue) { 
							return dataObject._set({
								name		 : propertyName,
								newValue	 : newValue,
								DataType	 : property.DataType,
								isManyToMany : property.isManyToMany
							});
						}
						break;

				}
				
				Object.defineProperty(
					dataObject, 
					property.variable, 
					{ 
						get : getFunction, 
						set : setFunction 
					}
				);
			})(this, property, propertyName);
		}
	}

	/* 
	 * Parameter field is a map
	 * {
	 * 	"name"     	   : string name of the field
	 * 	"DataType"     : optional, method to instatiate a Data object
	 * 				 	 if this field contains at least one entry
	 * 	"isManyToMany" : optional, default false, boolean value 
	 * 					 reflecting if this field represents a many to
	 * 					 many relationship with another library
	 * 	"ignoreCache"  : optional, default false. After a get call 
	 * 					 this property will be defined as a private
	 * 					 variable, eg property maxEvoMonster will be
	 * 					 set to this._maxEvoMonster. This is to cache
	 * 					 the property for quicker access. If
	 * 					 ignoreCache is set to true, this cached value
	 * 					 is not used and reset.
	 * }
	*/
	function get(field) {
		var thisFieldKey = "_" + this._toLowerCamelCase(field.name);
		if (field.ignoreCache || !this[thisFieldKey]) {
			
			// get the value of the field
			var fieldValue = this._entry.field(field.name);

			// but, if the value is a list of entries,
			// recalculate the field value
			if (field.DataType) {
				var entries = fieldValue;
				
				// if this is a many to many relationship,
				// the field value will be a list
				if (field.isManyToMany) {
					fieldValue = [];
					for (var i=0; i<entries.length; i++) {
						fieldValue.push(new field.DataType(entries[i]));
					}
				} 
				
				// otherwise, if this is a one to many relationship,
				// the field value will be a single object
				else {
					fieldValue = undefined;
					if (entries.length == 1) {
						fieldValue = new field.DataType(entries[0]);
					}
				}
			}
			
			this[thisFieldKey] = fieldValue;
		}
		return this[thisFieldKey];
	}

	function getCalculation(fieldName) {
		return this._entry.field(fieldName);
	}

	/* 
	 * Parameter field is a map
	 * {
	 * 	"name"     	   : string name of the field
	 * 	"newValue"     : is this field is not a relationship, then
	 * 					 newValue is a primitive such as a string,
	 * 					 number, or boolean; or newValue is a list of
	 * 					 primitives. If this field has a one to many
	 * 					 relationship, newValue must be a data object.
	 * 					 If this field has a many to many
	 * 					 relationship, newValue must be a list of data
	 * 					 objects.
	 * 	"DataType"     : optional, method to instatiate a Data object
	 * 				 	 if this field contains at least one entry
	 * 	"isManyToMany" : optional, default false, boolean value 
	 * 					 reflecting if this field represents a many to
	 * 					 many relationship with another library
	 * }
	*/
	function set(field) {
		var fieldValue = undefined;
		if (field.DataType) {

			// many to many relationship
			if (field.isManyToMany) {
				var dataCollection = field.newValue;
				fieldValue = [];
				for (var i=0; i<dataCollection.length; i++) {
					var dataObject = dataCollection[i];
					fieldValue.push(dataObject._entry);
				}
			} 

			// one to many relationship
			else if (field.newValue) {
				fieldValue = field.newValue._entry;
			}
		} 

		// no relationship
		else {
			fieldValue = field.newValue;
		}

		this._entry.set(field.name, fieldValue);
		return this._get({
			name		 : field.name,
			DataType	 : field.DataType,
			isManyToMany : field.isManyToMany,
			ignoreCache  : true
		});
	}
	
	function toLowerCamelCase(string) {
		var lowerCamelCaseString =
			string[0].toLowerCase() + 
			string.slice(1).replace(/ /g, "");
		return lowerCamelCaseString;
	}
	
	function toUpperCamelCase(string) {
		var upperCamelCaseString =
			string[0].toUpperCase() + 
			string.slice(1).replace(/ /g, "");
		return upperCamelCaseString;
	}

	function logParams(methodName, parameters) {
		Logger.logParams(this._getLogHeader(methodName), methodName, parameters);
	}

	function logReturn(methodName, returnValue) {
		var logHeader = this._getLogHeader(methodName);
		Logger.logReturn(logHeader, methodName, returnValue);
	}

	function getLogHeader(methodName) {
		var dataType = this.constructor.name;
		return dataType + "." + this + "." + methodName;
	}

	function toString() {
		return this.name;
	}

	function equals(other) {
		return other && this.toString() == other.toString();
	}

})();
Data.PROPERTY_TYPES = {
	CALCULATION : "Calculation",
	CUSTOM      : "Custom",
	DEFAULT     : "Default"
};

// DATA COLLECTION - wrapper for library

var DataCollection = function DataCollection(libraryName, DataType) {
	this._init(libraryName, DataType);
};
DataCollection.prototype = (function () {

	return {
		_init 	   	  : init,
		get   	   	  : get,
		_add	   	  : add,
		_logParams	  : logParams,
		_logReturn 	  : logReturn,
		_getLogHeader : getLogHeader,
		toString	  : toString,
	};

	function init(libraryName, DataType) {
		
		// cache the library
		Object.defineProperty(this, "_library", { 
			get : function() { return libByName(libraryName); },
		});

		// cache the DataType
		Object.defineProperty(this, "_DataType", {
			get : function() { return DataType; }
		});

	}

	function get() {

		if (!this._collection) {
			var entries = this._library.entries();
			this._collection = [];
			for (var i=0; i<entries.length; i++) {
				var entry = entries[i];
				this._collection.push(new this._DataType(entry));
			}
		}
		return this._collection;

	}

	function add(entryData) {
		
		var entry = this._library.create({});
		
		for (var fieldName in entryData) {
			
			var field = entryData[fieldName];

			// check if field is a primitive, data object, 
			// or list of primtiives or data objects
			var value = undefined;
			
			if (field instanceof Data) {
				value = field._entry;
			} 
			else if (
				Array.isArray(field) && 
				field.length && 
				field[0] instanceof Data
			) {
				value = [];
				for (var i=0; i<field.length; i++) {
					var dataObject = field[i];
					value.push(dataObject._entry);
				}
			} 
			else {
				value = field;
			}
			
			// set this field in the entry
			entry.set(fieldName, value);
		}
		
		var dataObject = new this._DataType(entry);
		dataObject.update();
		return dataObject;
	}

	function logParams(methodName, parameters) {
		var logHeader = this._getLogHeader(methodName);

		var parametersString = "{}";
		if (parameters && Object.keys(parameters).length) {
			var parametersList = [];
			for (var key in parameters) {
				var parameter = parameters[key];
				parametersList.push(key + "=" + parameter);
			}
			parametersString = 
				"{ " + parametersList.join(", ") + " }";
		}

		log(logHeader + ": " + parametersString);
	}

	function logReturn(methodName, returnValue) {
		var logHeader = this._getLogHeader(methodName);
		log(logHeader + ".return: " + returnValue);
	}

	function getLogHeader(methodName) {
		return this + "." + methodName;
	}

	function toString() {
		return this.constructor.name;
	}

})();