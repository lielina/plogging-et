/**
 * Format phone number to Ethiopian format (+251)
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with +251 prefix
 */
export const formatEthiopianPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it already starts with +251, validate and return
    if (cleaned.startsWith('+251')) {
        const digitsAfter = cleaned.substring(4);
        // Ensure exactly 9 digits after +251
        if (digitsAfter.length <= 9) {
            return cleaned.substring(0, 4) + digitsAfter;
        }
        // If more than 9 digits, truncate to 9
        return cleaned.substring(0, 4) + digitsAfter.substring(0, 9);
    }

    // Remove + if present but not +251
    const digitsOnly = cleaned.replace(/\+/g, '');

    // If it starts with 251, add the +
    if (digitsOnly.startsWith('251')) {
        const after251 = digitsOnly.substring(3);
        if (after251.length <= 9) {
            return `+251${after251}`;
        }
        return `+251${after251.substring(0, 9)}`;
    }

    // If it starts with 0, replace with +251
    if (digitsOnly.startsWith('0')) {
        const after0 = digitsOnly.substring(1);
        if (after0.length <= 9) {
            return `+251${after0}`;
        }
        return `+251${after0.substring(0, 9)}`;
    }

    // If it's 9 digits starting with 9, add +251 prefix
    if (digitsOnly.length === 9 && digitsOnly.startsWith('9')) {
        return `+251${digitsOnly}`;
    }

    // If it's less than 9 digits and starts with 9, add +251 prefix
    if (digitsOnly.length <= 9 && digitsOnly.startsWith('9')) {
        return `+251${digitsOnly}`;
    }

    // If empty or invalid, return +251 prefix only (user will type the rest)
    if (digitsOnly.length === 0) {
        return '+251';
    }

    // For any other case, try to format as +251 + remaining digits (max 9)
    if (digitsOnly.length <= 9) {
        return `+251${digitsOnly}`;
    }

    // Return +251 + first 9 digits if longer
    return `+251${digitsOnly.substring(0, 9)}`;
};

/**
 * Remove +251 prefix for display purposes
 * @param phoneNumber - The phone number to clean
 * @returns Phone number without +251 prefix
 */
export const removeEthiopianPrefix = (phoneNumber: string): string => {
    if (phoneNumber.startsWith('+251')) {
        return phoneNumber.substring(4);
    }
    if (phoneNumber.startsWith('251')) {
        return phoneNumber.substring(3);
    }
    return phoneNumber;
};