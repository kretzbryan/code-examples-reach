// This is a higher order component for auth forms that I created. I didnt originally have this available, but I was going through old code and fixed this up for my job. The login and register form components were both becoming fairly big files, and they both had a lot of the same base logic, so I moved most of it to a higher order component with the exception of the submit action. Errors are handled with redux. and passed down to this component, as well as the actions required to update them.

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setAuthError, removeAuthError } from '../../redux/actions/errors';
import validator from 'validator';
import { errorStrings } from '../../utils/errors';
// Simple display component
import ErrMessage from '../Layout/ErrMessage';
import { setErrorFields } from '../../redux/actions/alert';

const authFormHOC = (WrappedComponent) => {
	const AuthFormComponent = ({
		// Sets error using the inputs key, and a string value set in utilites (see import)
		setAuthError,
		// removes error by key
		removeAuthError,
		// current state of auth errors.
		authErrors,
		...props
	}) => {
		// The form data is set when the child component mounts.
		const [formData, setFormData] = useState(null);

		const handleChange = (e) => {
			const { name, value } = e.target;
			if (value) {
				removeAuthError(name);
			}
			setFormData({
				...formData,
				[name]: value,
			});
		};

		// Checks for a strong password
		const passwordValidation = (p) => {
			if (/[A-Z]/.test(p) === false) {
				console.log(1);
				return false;
			} else if (/[0-9]/.test(p) === false) {
				console.log(2);
				return false;
			} else if (/[!@#$%^&*]/.test(p) === false) {
				console.log(3);
				return false;
			} else {
				return true;
			}
		};

		// Sets error and returns boolean for later comparison
		const setError = (boolean, key, message) => {
			if (!boolean) {
				setAuthError(key, message);
			}
			return boolean;
		};

		const canBeSubmitted = () => {
			// Stores key values to see if there is a 'retype password' field in the formData
			let passwordComparison = {};
			let allFieldsValid = true;
			let isValidField;

			for (let key in formData) {
				if (key === 'email') {
					isValidField = setError(
						validator.isEmail(formData[key]),
						key,
						errorStrings[key]
					);
				} else if (key === 'password1' || key === 'password2') {
					passwordComparison[key] = true;
					isValidField = setError(
						passwordValidation(formData[key]),
						key,
						errorStrings[key]
					);
				} else {
					isValidField = setError(formData[key], key, errorStrings[key]);
				}

				if (!isValidField && allFieldsValid) {
					allFieldsValid = false;
				}
			}
			const isRetypePassword =
				passwordComparison.password1 && passwordComparison.password2;

			const samePassword =
				formData.password1 === formData.password2 ? true : false;

			return (isRetypePassword ? samePassword : true) && allFieldsValid;
		};

		// Returns alert to let you know if the password is strong or weak.
		const handlePasswordStatus = (password) => {
			if (password && !passwordValidation(password)) {
				return <span className='weak'>Weak password</span>;
			} else if (password && passwordValidation(password)) {
				return <span className='strong'>Strong password</span>;
			} else {
				return null;
			}
		};

		// Returns alert to let you know if the retype password is the same.
		const handleSamePassword = (first, second) => {
			if (second && first === second) {
				return <span className='match'>Passwords Match</span>;
			} else if (second && first !== second) {
				return <span className='no-match'>Passwords Do Not Match</span>;
			} else {
				return null;
			}
		};

		// Returns Error component where necessary
		const returnError = (key) => {
			return authErrors && authErrors[key] ? (
				<ErrMessage text={authErrors[key]} />
			) : null;
		};

		// Clears form data when unmounts.
		useEffect(() => {
			return function cleanUp() {
				setFormData(null);
			};
		}, []);

		return (
			<WrappedComponent
				setErrorFields={setErrorFields}
				setAuthError={setAuthError}
				removeAuthError={removeAuthError}
				canBeSubmitted={canBeSubmitted}
				authErrors={authErrors}
				handleChange={handleChange}
				handlePasswordStatus={handlePasswordStatus}
				handleSamePassword={handleSamePassword}
				returnError={returnError}
				formData={formData}
				setFormData={setFormData}
				{...props}
			/>
		);
	};

	const mapStateToProps = (state) => ({
		authErrors: state.errors.authErrors,
	});

	return connect(mapStateToProps, {
		setAuthError,
		removeAuthError,
	})(AuthFormComponent);
};

export default authFormHOC;
