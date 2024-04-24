# Dummy-switch-webhook 🏠

Are you building your own home automation dashboard? Often, you need to save states, sensor values, and other data in a database outside Apple/Homebridge. 🚀

🤖 Dummy switch webhook is here to help! It's inspired by [homebridge-dummy](https://github.com/nfarina/homebridge-dummy), but with a twist - it sends data to a webhook. This is particularly useful if you want to persist the data anywhere else.

## Config:

```json
{
  "apiToken": "123321",
  "platform": "DummySwitchJub",
  "switches": [
    {
      "name": "HomeWindows",
      "webhook": "http://localhost:1337/iot-data"
    }
    (...)
  ]
}
```

- `platform` **required**: must always be "DummySwitchJub"
- `apiToken` Optional: Api token, if required. this will be set as a Authorization-header
- `Switch` **required**: Array of switches that should be added
- `switches[i].name` **required**: Name of the switch. Will be sent to the webhook url, and will also be the default name in the Home app
- `switches[i].webhook` **required**: Url to post the data, when the state changes

Made with :heart: in Aalborg, Denmark
