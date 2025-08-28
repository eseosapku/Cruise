import { isEmail, isEmpty, isLength } from 'validator';

export const validateEmail = (email: string): boolean => {
    return isEmail(email);
};

export const validatePassword = (password: string): boolean => {
    return !isEmpty(password) && isLength(password, { min: 6 });
};

export const validateUsername = (username: string): boolean => {
    return !isEmpty(username) && isLength(username, { min: 3, max: 20 });
};

export const validateForm = (data: { email: string; password: string; username: string }): boolean => {
    return validateEmail(data.email) && validatePassword(data.password) && validateUsername(data.username);
};