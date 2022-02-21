// Returns fields of an object
// item: Object
// keys: [String]
// Assumptions:
// All keys in the keys argument are unique keys found in the item argument.
// null values do not exist in this object.

export default function returnItemFields(item, keys) {
	const foundKeys = [];
	const results = {};
	const keyMap = {};
	keys.forEach((key) => {
		keyMap[key] = true;
	});

	const returnKeyValues = (item, currentKey = null) => {
		// If all key value pairs have been found, there is no need to traverse further
		if (foundKeys.length === keys.length) {
			return null;
		}
		// if the current key argument is found in keyMap, save to results
		if (keyMap[currentKey]) {
			results[currentKey] = item;
			foundKeys.push(currentKey);
			return null;
		}
		// The particular data structure this is for - which comes from a third party API - has arrays that will only have a length of one. This array checker accounts for that.
		if (Array.isArray(item)) {
			for (let index of item) {
				returnKeyValues(index);
			}
		}
		// If the current key isnt found, traverse through next group of fields
		else if (typeof item === 'object') {
			for (let key in item) {
				returnKeyValues(item[key], key);
			}
		} else return null;
	};

	returnKeyValues(item);
	return results;
}
