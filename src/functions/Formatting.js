export const formatDate = (serverTimestamp) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    const getOrdinalSuffix = (day) => {
        if (day >= 11 && day <= 13) return 'th';
        if (day % 10 === 1) return 'st';
        if (day % 10 === 2) return 'nd';
        if (day % 10 === 3) return 'rd';
        return 'th';
    };

    const formatTime = (hours, minutes) => {
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
    };

    const date = serverTimestamp.toDate();
     const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    return `${day} ${month} ${year} - ${formatTime(hours, minutes)}${ampm}`;
};
