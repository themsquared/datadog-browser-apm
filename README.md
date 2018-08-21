# datadog-browser-apm
Browser Resource Load Monitoring for Datadog APM

## How to use this:

1. Place `tracker.js` in an accesible location and place it at the top of your web-page in the `<head>` tags. Make sure you include this prior to any other scripts loading.
2. Create a reverse-proxy (using nginx, apache, etc) to the Datadog APM agent and ensure the variable `DD_POST_URL` in `tracker.js` is set to this URL. 
3. Load your webpage.

## Results
![Demo](https://github.com/themsquared/datadog-browser-apm/blob/master/demo.png)

## Compatibility
Does not work with Edge currently.
