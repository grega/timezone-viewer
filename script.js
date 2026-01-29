// returns array of objects: { timezone, customLabel, isPureOffset }
function getTimezones() {
    const params = new URLSearchParams(window.location.search);
    const tzParam = params.get('tz');

    if (tzParam) {
        return tzParam.split(',').map(tz => {
            const trimmed = tz.trim();

            let timezone = trimmed;
            let customLabel = null;

            // check if custom label is provided (eg. "America/Los_Angeles:San Francisco")
            if (trimmed.includes(':')) {
                [timezone, customLabel] = trimmed.split(':').map(s => s.trim());
            }

            // check if it's a UTC offset (eg. "+4", "-5", "0")
            if (/^[+-]?\d+$/.test(timezone)) {
                const offset = parseInt(timezone);
                // use Etc/GMT with inverted sign (IANA convention)
                const ianaOffset = -offset;
                const ianaTimezone = `Etc/GMT${ianaOffset >= 0 ? '+' : ''}${ianaOffset}`;

                // if no custom label, display as pure offset (e.g., "UTC+4")
                if (!customLabel) {
                    const offsetLabel = `UTC${offset >= 0 ? '+' : ''}${offset}`;
                    return { timezone: ianaTimezone, customLabel: offsetLabel, isPureOffset: true };
                }

                // with custom label, treat as named timezone
                return { timezone: ianaTimezone, customLabel, isPureOffset: false };
            }

            return { timezone, customLabel, isPureOffset: false };
        });
    }

    return [
        { timezone: 'Europe/London', customLabel: null, isPureOffset: false },
        { timezone: 'America/New_York', customLabel: null, isPureOffset: false },
        { timezone: 'America/Chicago', customLabel: null, isPureOffset: false },
        { timezone: 'America/Los_Angeles', customLabel: null, isPureOffset: false }
    ];
}

function getTimezoneAbbr(date, timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
}

function formatTime(date, timezone) {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const time = timeFormatter.format(date);
    const abbr = getTimezoneAbbr(date, timezone);

    return { time, abbr };
}

function getHourInTimezone(date, timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
    });
    return parseInt(formatter.format(date));
}

function isWorkingHours(date, timezone) {
    const hour = getHourInTimezone(date, timezone);
    return hour >= 8 && hour < 19;
}

// extract location from timezone (e.g., "America/New_York" -> "New York")
function getFriendlyLocation(timezone) {
    const parts = timezone.split('/');
    if (parts.length > 1) {
        return parts[parts.length - 1].replace(/_/g, ' ');
    }
    return timezone;
}

function formatDate(date) {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    return `${weekday}, ${day} ${month}`;
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

function renderTable() {
    const timezones = getTimezones();
    const container = document.getElementById('days-container');
    container.innerHTML = '';
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
        const dayDate = new Date(now);
        dayDate.setDate(dayDate.getDate() + dayOffset);
        dayDate.setHours(0, 0, 0, 0);

        const details = document.createElement('details');
        details.classList.add('day-section');

        if (isToday(dayDate)) {
            details.classList.add('today');
            details.open = true;
        }

        if (dayOffset === 1) {
            details.open = true;
        }

        const summary = document.createElement('summary');
        summary.textContent = formatDate(dayDate);
        details.appendChild(summary);

        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('table-wrapper');

        const table = document.createElement('table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const timeHeader = document.createElement('th');
        timeHeader.textContent = 'Time (local)';
        headerRow.appendChild(timeHeader);

        timezones.forEach(tzObj => {
            const th = document.createElement('th');

            // for pure offsets, just show the offset label (eg. "UTC+4")
            if (tzObj.isPureOffset) {
                th.textContent = tzObj.customLabel;
            } else {
                const sampleDate = new Date();
                const abbr = getTimezoneAbbr(sampleDate, tzObj.timezone);
                const location = tzObj.customLabel || getFriendlyLocation(tzObj.timezone);
                th.textContent = `${abbr} (${location})`;
            }

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        // start at current hour for today, 0 for other days
        const startHour = (dayOffset === 0) ? now.getHours() : 0;

        for (let hour = startHour; hour < 24; hour++) {
            const hourDate = new Date(dayDate);
            hourDate.setHours(hour);

            const row = document.createElement('tr');

            const hourCell = document.createElement('td');
            hourCell.textContent = String(hour).padStart(2, '0') + ':00';
            row.appendChild(hourCell);

            timezones.forEach(tzObj => {
                const td = document.createElement('td');
                const { time, abbr } = formatTime(hourDate, tzObj.timezone);

                // for pure offsets, don't show abbreviation (header already shows UTC+X)
                if (tzObj.isPureOffset) {
                    td.innerHTML = `<span class="time-display">${time}</span>`;
                } else {
                    td.innerHTML = `<span class="time-display">${time}<span class="tz-abbr">${abbr}</span></span>`;
                }

                if (isWorkingHours(hourDate, tzObj.timezone)) {
                    td.classList.add('working-hours');
                }

                row.appendChild(td);
            });

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        details.appendChild(tableWrapper);
        container.appendChild(details);
    }
}

renderTable();
