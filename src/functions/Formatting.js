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






export const AMPMTime = (serverTimestamp) => {


    const serverDate = serverTimestamp.toDate()
    const currentDate = new Date();
    const serverHours = serverDate.getHours();
    const serverMinutes = serverDate.getMinutes();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    let AMPMTime
    if (currentHours > serverHours || (currentHours === serverHours && currentMinutes >= serverMinutes)) {
        // The current time is greater than or equal to the server time
        if (serverHours === 0) {
            AMPMTime = '12:' + serverMinutes.toString().padStart(2, '0') + ' AM';
        } else if (serverHours === 12) {
            AMPMTime = '12:' + serverMinutes.toString().padStart(2, '0') + ' PM';
        } else if (serverHours > 12) {
            AMPMTime = (serverHours - 12).toString().padStart(2, '0') + ':' + serverMinutes.toString().padStart(2, '0') + ' PM';
        } else {
            AMPMTime = serverHours.toString().padStart(2, '0') + ':' + serverMinutes.toString().padStart(2, '0') + ' AM';
        }
    } else {
        if (serverHours === 0) {
            AMPMTime = '12:' + serverMinutes.toString().padStart(2, '0') + ' AM';
        } else if (serverHours === 12) {
            AMPMTime = '12:' + serverMinutes.toString().padStart(2, '0') + ' PM';
        } else {
            AMPMTime = serverHours.toString().padStart(2, '0') + ':' + serverMinutes.toString().padStart(2, '0') + ' AM';
        }
    }

    return AMPMTime;

};





export const categorizeDate = (createdAt) => {
    const today = new Date();
    const contributionDate = createdAt.toDate();

    // Calculate the difference in days
    const timeDifference = Math.floor((today - contributionDate) / (1000 * 60 * 60 * 24));

    if (timeDifference === 0) {
      return 'Today';
    }
    if (timeDifference === 1) {
      return 'Yesterday';
    }

    // Check if it's within the past week
    if (timeDifference <= 7) {
      // Use the day of the week
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return daysOfWeek[contributionDate.getDay()];
    }

    // If it's older than a week, return the formatted date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return contributionDate.toLocaleDateString(undefined, options);
  }