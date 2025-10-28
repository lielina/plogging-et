/**
 * Utility functions for event status determination and handling
 */

export interface EventStatusInfo {
    status: 'upcoming' | 'active' | 'completed' | 'unknown';
    canEnroll: boolean;
    canCheckIn: boolean;
    message: string;
}

/**
 * Determine the status of an event based on its date and time
 * @param eventDate The date of the event
 * @param startTime The start time of the event
 * @param endTime The end time of the event
 * @returns EventStatusInfo object with status and action permissions
 */
export function getEventStatus(
    eventDate: string,
    startTime: string,
    endTime: string
): EventStatusInfo {
    try {
        const now = new Date();

        // Parse event date and times
        const eventDateObj = new Date(eventDate);

        // Create full datetime objects for start and end
        const eventStartStr = eventDateObj.toISOString().split('T')[0] + 'T' + startTime;
        const eventEndStr = eventDateObj.toISOString().split('T')[0] + 'T' + endTime;

        const eventStart = new Date(eventStartStr);
        const eventEnd = new Date(eventEndStr);

        // Handle case where end time is next day (e.g., 22:00 to 02:00)
        if (eventEnd < eventStart) {
            eventEnd.setDate(eventEnd.getDate() + 1);
        }

        // Determine status based on current time
        if (now < eventStart) {
            // Event is in the future
            return {
                status: 'upcoming',
                canEnroll: true,
                canCheckIn: false,
                message: 'This event is upcoming and accepting enrollments.'
            };
        } else if (now >= eventStart && now <= eventEnd) {
            // Event is currently happening
            return {
                status: 'active',
                canEnroll: false,
                canCheckIn: true,
                message: 'This event is currently active and accepting check-ins.'
            };
        } else {
            // Event has ended
            return {
                status: 'completed',
                canEnroll: false,
                canCheckIn: false,
                message: 'This event has already completed.'
            };
        }
    } catch (error) {
        console.error('Error determining event status:', error);
        return {
            status: 'unknown',
            canEnroll: false,
            canCheckIn: false,
            message: 'Unable to determine event status.'
        };
    }
}

/**
 * Format time string to ensure it's in HH:MM format
 * @param timeString The time string to format
 * @returns Formatted time string in HH:MM format
 */
export function formatTimeForComparison(timeString: string): string {
    if (!timeString) return '00:00';

    // Handle various time formats
    if (timeString.includes('T')) {
        // ISO format datetime, extract time
        const timePart = timeString.split('T')[1];
        if (timePart) {
            return timePart.substring(0, 5); // Extract HH:MM
        }
    }

    // Already in HH:MM format
    if (/^\d{2}:\d{2}/.test(timeString)) {
        return timeString.substring(0, 5);
    }

    // Handle HH:MM:SS format
    if (/^\d{2}:\d{2}:\d{2}/.test(timeString)) {
        return timeString.substring(0, 5);
    }

    // Handle single digit hours (9:00 -> 09:00)
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    return '00:00';
}

/**
 * Generate a shareable link for an event
 * @param eventId The ID of the event
 * @returns The full URL for the event
 */
export function generateEventShareLink(eventId: number): string {
    return `https://ploggingethiopia.org/events/${eventId}`;
}

/**
 * Copy text to clipboard with fallback
 * @param text The text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    }
}