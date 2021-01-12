# <a name="title">PII Filter Web Extension- personally identifiable information filter</a>

See: [PIIF](https://github.com/prolody/piif)

The PII Filter project aims to build a personally identifiable information (PII) filter for all Dutch users of the
internet. This repository contains the web-extension code for the PII Filter.

## Current Limitations:
- Only tracks text entered in the field which has focus. (previously filled fields are ignored until focused)

## Future work:
- Provide more detailed feedback to the user.
- Leverage a solution such as [arrive](https://github.com/uzairfarooq/arrive) in order to keep track of fields which
  were added / removed dynamically, in the case that they contain sensitive pre-filled information. Or tailor a solution
  using MutationObservers.
- Track text input across multiple inputs on a page, and / or website.
- Provide more graphical feedback near user input, this existed before [dev e0f18b0], by traversing the iframe
  hierarchy, but was hard to maintain. Another option is to only provide feedback directly near the input in the current
  frame.

## Testing:
- Open Firefox
- Type `about:debugging` in the address bar
- Select `This Firefox` on the left
- Click `Load Temporary Add-on`
- Select `manifest.json` inside this folder
- Wait until the welcome page loads
- The add-on can now be used