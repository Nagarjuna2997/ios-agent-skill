# WeatherKit REST API

## Context

Load this when a task names **WeatherKit REST API** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/weatherkitrestapi) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Obtain historical, current, and predictive weather for your app or service.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `WeatherKit REST API`.

Documentation language identifiers: data.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| Weather API | 1.0.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Fundamentals

- [Request authentication for WeatherKit REST API](https://developer.apple.com/documentation/weatherkitrestapi/request-authentication-for-weatherkit-rest-api)

### Obtaining weather information for a location

- [GET /api/v1/availability/{latitude}/{longitude}](https://developer.apple.com/documentation/weatherkitrestapi/get-api-v1-availability-_latitude_-_longitude_)
- [GET /api/v1/weather/{language}/{latitude}/{longitude}](https://developer.apple.com/documentation/weatherkitrestapi/get-api-v1-weather-_language_-_latitude_-_longitude_)
- [Weather](https://developer.apple.com/documentation/weatherkitrestapi/weather)
- [Latitude](https://developer.apple.com/documentation/weatherkitrestapi/latitude)
- [Longitude](https://developer.apple.com/documentation/weatherkitrestapi/longitude)
- [DataSet](https://developer.apple.com/documentation/weatherkitrestapi/dataset)

### Obtaining current weather information

- [CurrentWeather](https://developer.apple.com/documentation/weatherkitrestapi/currentweather)
- [Metadata](https://developer.apple.com/documentation/weatherkitrestapi/metadata)
- [ProductData](https://developer.apple.com/documentation/weatherkitrestapi/productdata)

### Obtaining minute-to-minute forecast weather

- [ForecastPeriodSummary](https://developer.apple.com/documentation/weatherkitrestapi/forecastperiodsummary)
- [ForecastMinute](https://developer.apple.com/documentation/weatherkitrestapi/forecastminute)

### Obtaining hourly weather information

- [HourWeatherConditions](https://developer.apple.com/documentation/weatherkitrestapi/hourweatherconditions)
- [HourlyForecast](https://developer.apple.com/documentation/weatherkitrestapi/hourlyforecast)
- [NextHourForecast](https://developer.apple.com/documentation/weatherkitrestapi/nexthourforecast)

### Obtaining daily weather information

- [DayWeatherConditions](https://developer.apple.com/documentation/weatherkitrestapi/dayweatherconditions)
- [DayPartForecast](https://developer.apple.com/documentation/weatherkitrestapi/daypartforecast)
- [DailyForecast](https://developer.apple.com/documentation/weatherkitrestapi/dailyforecast)

### Obtaining weather alerts

- [GET /api/v1/weatherAlert/{language}/{id}](https://developer.apple.com/documentation/weatherkitrestapi/get-api-v1-weatheralert-_language_-_id_)
- [WeatherAlert](https://developer.apple.com/documentation/weatherkitrestapi/weatheralert)
- [WeatherAlertCollection](https://developer.apple.com/documentation/weatherkitrestapi/weatheralertcollection)
- [WeatherAlertSummary](https://developer.apple.com/documentation/weatherkitrestapi/weatheralertsummary)
- [ResponseType](https://developer.apple.com/documentation/weatherkitrestapi/responsetype)
- [Severity](https://developer.apple.com/documentation/weatherkitrestapi/severity)
- [Urgency](https://developer.apple.com/documentation/weatherkitrestapi/urgency)

### Identifying weather events

- [UnitsSystem](https://developer.apple.com/documentation/weatherkitrestapi/unitssystem)
- [MoonPhase](https://developer.apple.com/documentation/weatherkitrestapi/moonphase)
- [PrecipitationType](https://developer.apple.com/documentation/weatherkitrestapi/precipitationtype)
- [PressureTrend](https://developer.apple.com/documentation/weatherkitrestapi/pressuretrend)

### Obtaining event information

- [EventText](https://developer.apple.com/documentation/weatherkitrestapi/eventtext)
- [Certainty](https://developer.apple.com/documentation/weatherkitrestapi/certainty)

### Performing attribution

- [GET /attribution/{language}](https://developer.apple.com/documentation/weatherkitrestapi/get-attribution-_language_)
- [Attribution](https://developer.apple.com/documentation/weatherkitrestapi/attribution)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
