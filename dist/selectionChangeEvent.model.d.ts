export declare enum SelectionChangeEventReason {
    SelectionChanged = 1,
    LockOverride = 2,
}
export declare class SelectionChangeEvent {
    reason: SelectionChangeEventReason;
    selection: SVGElement[];
}
