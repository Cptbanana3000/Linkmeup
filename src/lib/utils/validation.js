export const profileValidation = {
    username: {
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_]+$/,
        messages: {
            required: 'Username is required',
            minLength: 'Username must be at least 3 characters long',
            maxLength: 'Username cannot exceed 30 characters',
            pattern: 'Username can only contain letters, numbers and underscores',
            taken: 'This username is already taken'
        }
    },
    bio: {
        maxLength: 160,
        messages: {
            maxLength: 'Bio cannot exceed 160 characters'
        }
    }
};

export function validateProfile(data) {
    const errors = {};

    // Username validation
    if (!data.username) {
        errors.username = profileValidation.username.messages.required;
    } else {
        if (data.username.length < profileValidation.username.minLength) {
            errors.username = profileValidation.username.messages.minLength;
        }
        if (data.username.length > profileValidation.username.maxLength) {
            errors.username = profileValidation.username.messages.maxLength;
        }
        if (!profileValidation.username.pattern.test(data.username)) {
            errors.username = profileValidation.username.messages.pattern;
        }
    }

    // Bio validation
    if (data.bio && data.bio.length > profileValidation.bio.maxLength) {
        errors.bio = profileValidation.bio.messages.maxLength;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
} 