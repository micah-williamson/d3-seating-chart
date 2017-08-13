export const InlineStyle = `
  [{@uid}] * {
    pointer-events: none;
  }

  [{@uid}] .focused, svg .focused > * {
    pointer-events: initial;
  }
`;