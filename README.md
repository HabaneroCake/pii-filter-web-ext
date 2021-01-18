# ![PII](https://raw.githubusercontent.com/prolody/piif_web_ext/master/assets/logos/a/PIIlogo.png) Filter Web Extension

This project aims to build a personally identifiable information (PII) filter for users of 
the internet (currently only Dutch supported). This repository contains the web-extension code for the PII Filter.

See [this repository](https://github.com/prolody/piif) for the datasets and npm module.

## Current Limitations:
- Only tracks text entered in the field which has focus. (previously filled fields are ignored until focused)
- Only supports the Dutch language

## Future work:
- Add support for multiple locales.
- Provide more detailed feedback to the user.
- Leverage a solution such as [arrive](https://github.com/uzairfarooq/arrive) in order to keep track of fields which
  were added / removed dynamically, in the case that they contain sensitive pre-filled information. Or tailor a solution
  using MutationObservers.
- Track text input across multiple inputs on a page, and / or website.
- Provide more graphical feedback near user input, this existed before [dev e0f18b0], by traversing the iframe
  hierarchy, but was hard to maintain. Another option is to only provide feedback directly near the input in the current
  frame.

## Testing (Firefox):
- type `about:debugging` in the address bar
- Select `This Firefox` on the left
- click `Load Temporary Add-on`
- select `manifest.json` inside this folder
- wait until the welcome page loads
- the add-on can now be used

## Testing (Chrome):
- Type `chrome://extensions/` in the address bar
- enable `developer mode` on the top right
- click `Load unpacked`
- select inside this folder
- wait until the welcome page loads
- the add-on can now be used

## Building:
- `npm install`
- `npm run compile`