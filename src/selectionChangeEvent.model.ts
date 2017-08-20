export enum SelectionChangeEventReason {
  SelectionChanged = 1,
  LockOverride
}

export class SelectionChangeEvent {
  reason: SelectionChangeEventReason;
  selection: SVGElement[];
}