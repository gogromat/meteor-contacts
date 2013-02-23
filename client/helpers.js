function setObjectInnerArray(object, array, key, value) {
	if (object && array && key && value) {
		object[array] = new Object;
		object[array][key] = value;
	}
	return object;
}