import { Selection, EnterElement } from "d3";
export declare class D3SeatingChart {
    private element;
    private margin;
    private focusedSelection;
    private focusGroup;
    private history;
    private zoomChangedListeners;
    private constructor();
    private init();
    stripStyles(selector: string): void;
    getBoard(): Selection<Element | Window | Document | EnterElement, {}, null, undefined>;
    getSeatingAreas(): Selection<Element | Window | Document | EnterElement, {}, HTMLElement, {}>;
    getSeatingAreaExposes(): Selection<Element | Window | Document | EnterElement, {}, HTMLElement, {}>;
    getSeats(): Selection<Element | Window | Document | EnterElement, {}, HTMLElement, {}>;
    goToBoard(): void;
    clearHistory(): void;
    canGoBack(): boolean;
    goBack(): void;
    registerZoomChangeListener(fn: Function): () => void;
    zoom(selection: any, animate?: boolean): void;
    refresh(): void;
    private bindEvents();
    static attach(element: HTMLElement): D3SeatingChart;
}
