/**
 * Format phone number to Ethiopian format (+251)
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with +251 prefix
 */
export const formatEthiopianPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If it already starts with +251, return as is
    if (phoneNumber.startsWith('+251')) {
        return phoneNumber;
    }

    // If it starts with 251, add the +
    if (phoneNumber.startsWith('251')) {
        return `+${phoneNumber}`;
    }

    // If it starts with 0, replace with +251
    if (digitsOnly.startsWith('0')) {
        return `+251${digitsOnly.substring(1)}`;
    }

    // If it's 9 digits, assume it's missing the +251 prefix
    if (digitsOnly.length === 9 && digitsOnly.startsWith('9')) {
        return `+251${digitsOnly}`;
    }

    // Return the original if none of the above conditions match
    return phoneNumber;
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