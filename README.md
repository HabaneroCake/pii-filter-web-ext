# <a name="title">PII Filter Web Extension- personally identifiable information filter</a>

See: [PIIF](https://github.com/prolody/piif)

The PII Filter project aims to build a personally identifiable information (PII) filter for all Dutch users of the
internet. This repository contains the web-extension code for the PII Filter.

## Current Limitations:
- Only tracks text entered in the field which has focus. (previously filled fields are ignored)

## Future work:
- Leverage a solution such as [arrive](https://github.com/uzairfarooq/arrive) in order to keep track of fields which
  were added / removed dynamically, in the case that they contain sensitive pre-filled information. Or tailor a solution
  using MutationObservers.
- Track text input across multiple inputs on a page, and / or website.