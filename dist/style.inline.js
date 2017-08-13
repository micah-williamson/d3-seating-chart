"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineStyle = `
  [{@uid}] * {
    pointer-events: none;
  }

  [{@uid}] .focused, svg .focused > * {
    pointer-events: initial;
  }
`;
//# sourceMappingURL=style.inline.js.map