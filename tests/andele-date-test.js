const monthNames = {
    'janvāris': 0,
    'februāris': 1,
    'marts': 2,
    'aprīlis': 3,
    'maijs': 4,
    'jūnijs': 5,
    'jūlijs': 6,
    'augusts': 7,
    'septembris': 8,
    'oktobris': 9,
    'novembris': 10,
    'decembris': 11,
};

function parseDate(dateString) {
    const today = new Date();

    if (dateString.startsWith('šodien')) {
        const time = dateString.split(',')[1].trim().split(':');
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), +time[0], +time[1]);
        return date;
    }

    if (dateString.startsWith('vakar')) {
        const time = dateString.split(',')[1].trim().split(':');
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, +time[0], +time[1]);
        return date;
    }

    const parts = dateString.split(', ');
    if (parts.length !== 2) {
        throw new Error(`Invalid date string format: ${dateString}`);
    }

    const dateParts = parts[0].split('. ');
    if (dateParts.length !== 2) {
        throw new Error(`Invalid date string format: ${dateString}`);
    }

    const day = parseInt(dateParts[0], 10);
    const month = monthNames[dateParts[1].toLowerCase()]; // Adjust for case sensitivity
    const timeParts = parts[1].split(':');
    if (timeParts.length !== 2) {
        throw new Error(`Invalid time string format: ${parts[1]}`);
    }
    
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    // Check for valid month index
    if (isNaN(month) || month < 0 || month > 11) {
        throw new Error(`Invalid month: ${dateParts[1]}`);
    }

    const date = new Date(today.getFullYear(), month, day, hour, minute);
    return date;
}

const arr = ['1. jūnijs, 23:16', 'šodien, 11:35', 'vakar, 7:05'];

arr.forEach((date) => {
    try {
        const res = parseDate(date);
        console.log(res.toLocaleString('en-US', { timeZone: 'Europe/Riga' }));
    } catch (error) {
        console.error(`Error parsing date "${date}":`, error.message);
    }
});
