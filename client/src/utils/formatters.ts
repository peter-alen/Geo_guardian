/**
 * Formats a duration in minutes into a human-readable string.
 * If > 60 minutes, returns "X hr Y min".
 * If <= 60 minutes, returns "X min".
 * @param minutes - Duration in minutes
 */
export const formatDuration = (minutes: number): string => {
    if (!minutes || isNaN(minutes)) return '0 min';

    const totalMinutes = Math.round(minutes);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0) {
        return `${h} hr ${m > 0 ? `${m} min` : ''}`;
    }
    return `${m} min`;
};
