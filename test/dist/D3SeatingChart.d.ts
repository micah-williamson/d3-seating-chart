import { Selection, EnterElement } from "d3";
export declare enum ShowBehavior {
    All = 1,
    DirectDecendants = 2,
    AllDecendants = 3,
}
export interface D3SeatingChartConfig {
    showBehavior: ShowBehavior;
}
export declare class D3SeatingChart {
    private element;
    private margin;
    focusedElement: any;
    private history;
    private zoomChangedListeners;
    private config;
    private uniqueIdentifier;
    private constructor();
    private init(config);
    stripStyles(selector: string): void;
    getBoard(): Selection<Element | Document | EnterElement | Window, {}, null, undefined>;
    getSeatingAreas(): Selection<Element | Document | EnterElement | Window, {}, HTMLElement, {}>;
    getSeatingAreaExposes(): Selection<Element | Document | EnterElement | Window, {}, HTMLElement, {}>;
    getSeats(): Selection<Element | Document | EnterElement | Window, {}, HTMLElement, {}>;
    goToBoard(): void;
    clearHistory(): void;
    canGoBack(): boolean;
    goBack(): void;
    registerZoomChangeListener(fn: Function): () => void;
    zoom(selection: any, animate?: boolean): void;
    private getInverse(selection);
    private getShowList(selection);
    private getHideList(selection);
    refresh(): void;
    private bindEvents();
    static attach(element: HTMLElement, config?: D3SeatingChartConfig): D3SeatingChart;
}
