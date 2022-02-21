// This is a snippet of code that handles populating hotel information whenever a user inputs relevant flight information. When a flight departure or destination changes, it will either create and new hotelDetail object with populated information if it doesnt exist, or edit an existing hotel field in relation to its index.

// returns appropriate city information from static file if found, this function is found in a utilities folder away from the component

const findCity = ({ cityName, countryName }) => {
	const found = hotel_city_codes.find(
		(item) =>
			item['city_name'] === cityName &&
			item['country_name'].includes(countryName)
	);
	return found
		? {
				cityCode: found['city_code'],
				countryCode: found['country_code'],
				cityName: found['city_name'],
		  }
		: null;
};

// find served location of airport from static file,  this function is found in a utilities folder away from the component
const returnLocation = (destination) => {
	const servedLocation = airports
		.find((item) => item['IATA'] === destination)
		['Location Served'].split(', ');
	const countryName = servedLocation[servedLocation.length - 1].toUpperCase();
	const cityName = servedLocation[0].toUpperCase();
	const city = findCity({
		cityName,
		countryName,
	});

	return city;
};

// handles unnecessary calls to global state
const handleEdit = (found, updated) => {
	let equal = true;
	for (let key in found) {
		if (found[key] !== updated[key]) {
			equal = false;
		}
	}
	if (!equal) {
		// Edits the hotel with its corresponding flight index
		editSuggestedHotel(updated);
	}
};

// Stores and returns updated fields
const returnUpdatedFields = () => {
	const city = returnLocation(flight.destination);
	let prevUpdated, currentUpdated;
	currentUpdated = {
		city,
		startDate: flight.departureDate,
	};

	prevUpdated = {
		endDate: flight.departureDate,
	};

	return { prevUpdated, currentUpdated };
};

useEffect(() => {
	const currentIndexedHotel = hotelDetails.find(
		(item) => item.flightIndex === index
	);
	const prevIndexedHotel = hotelDetails.find(
		(item) => item.flightIndex === index - 1
	);

	if (flight.destination && flight.departureDate) {
		let { prevUpdated, currentUpdated } = returnUpdatedFields();

		if (typeof currentIndexedHotel === 'undefined' && hotelDetails.length < 6) {
			// Creates new input group to capture hotel information if one doesnt exist, some of this data, such as idealLocation and lodgingPrice, is information found on the user profile.
			addSuggestedHotel({
				city,
				startDate: flight.departureDate,
				endDate: '',
				radius: idealLocation >= 0 ? idealLocation : '',
				priceRange: lodgingPrice || '',
				flightIndex: index,
				rooms: 1,
			});
		} else {
			currentUpdated = { ...currentIndexedHotel, ...currentUpdated };
			handleEdit(currentIndexedHotel, currentUpdated);
		}
		if (typeof prevIndexedHotel !== 'undefined') {
			prevUpdated = { ...prevIndexedHotel, ...prevUpdated };
			handleEdit(prevIndexedHotel, prevUpdated);
		}
	}
}, []);
