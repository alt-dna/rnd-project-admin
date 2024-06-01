export function formatDate(createdAt, locale = 'vn-VN', includeTime = true) {
    const dateOptions = {
        day: 'numeric', month: 'numeric', year: 'numeric',
        hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    if (!includeTime) {
        delete dateOptions.hour12;
        delete dateOptions.hour;
        delete dateOptions.minute;
        delete dateOptions.second;
    }

    const dateString = new Date(createdAt).toLocaleString(locale, dateOptions);

    if (includeTime) {
        const [datePart, timePart] = dateString.split(', ');
        let [month, day, year] = datePart.split('/');

        day = parseInt(day, 10);
        month = parseInt(month, 10);

        return `${day}/${month}/${year}, ${timePart}`;
    } else {
        let [month, day, year] = dateString.split('/');

        day = parseInt(day, 10);
        month = parseInt(month, 10);

        return `${day}/${month}/${year}`;
    }
}
