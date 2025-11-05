import { VolunteerBadge } from './api';

/**
 * Compare two arrays of badges and return the newly earned badges
 * @param oldBadges - Previously earned badges
 * @param newBadges - Current badges from API
 * @returns Array of newly earned badges
 */
export const getNewlyEarnedBadges = (oldBadges: VolunteerBadge[], newBadges: VolunteerBadge[]): VolunteerBadge[] => {
    // Create a set of existing badge IDs for quick lookup
    const oldBadgeIds = new Set(oldBadges.map(badge => badge.badge_id));

    // Filter new badges to only include those not in the old set
    return newBadges.filter(badge => !oldBadgeIds.has(badge.badge_id));
};

/**
 * Check if two badges are equal based on their properties
 * @param badge1 - First badge to compare
 * @param badge2 - Second badge to compare
 * @returns Boolean indicating if badges are equal
 */
export const areBadgesEqual = (badge1: VolunteerBadge, badge2: VolunteerBadge): boolean => {
    return (
        badge1.badge_id === badge2.badge_id &&
        badge1.badge_name === badge2.badge_name &&
        badge1.description === badge2.description &&
        badge1.image_url === badge2.image_url &&
        badge1.criteria_type === badge2.criteria_type &&
        badge1.criteria_value === badge2.criteria_value &&
        badge1.is_active === badge2.is_active
    );
};

/**
 * Format badge data for display
 * @param badge - Badge object from API
 * @returns Formatted badge information
 */
export const formatBadgeForDisplay = (badge: VolunteerBadge) => {
    return {
        id: badge.badge_id,
        name: badge.badge_name,
        description: badge.description,
        imageUrl: badge.image_url,
        earnedDate: badge.pivot?.earned_date ? new Date(badge.pivot.earned_date) : null,
        criteria: {
            type: badge.criteria_type,
            value: badge.criteria_value
        }
    };
};