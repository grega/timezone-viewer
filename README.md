# Timezone viewer

A simple single-page HTML tool to view upcoming times across multiple timezones for the next 14 days.

## Usage

The page displays hourly times for today and the next 14 days, with working hours (08:00-18:00) highlighted for each timezone.

## Customizing timezones

Add `?tz=` to the URL with comma-separated timezone names.

**Custom labels:** Add `:CustomName` after any timezone to override the default location name.

### Examples

- `?tz=Europe/London,America/New_York,America/Los_Angeles`
- `?tz=Europe/London,America/Chicago,America/Los_Angeles:San Francisco`
- `?tz=Europe/London:UK,America/New_York:NYC,America/Los_Angeles:SF`

### Common timezones

Assuming no DST adjustments:

- Pacific/Auckland (NZDT, UTC+13)
- Australia/Sydney (AEDT, UTC+11)
- Asia/Tokyo (JST, UTC+9)
- Asia/Hong_Kong (HKT, UTC+8)
- Asia/Singapore (SGT, UTC+8)
- Asia/Dubai (GST, UTC+4)
- Europe/Paris (CET, UTC+1)
- Europe/London (GMT, UTC+0)
- America/New_York (EST, UTC-5)
- America/Chicago (CST, UTC-6)
- America/Denver (MST, UTC-7)
- America/Phoenix (MST, UTC-7)
- America/Los_Angeles (PST, UTC-8)
- America/Anchorage (AKST, UTC-9)
