import { Selection, EnterElement } from "d3";
export declare class D3SeatingChart {
    private element;
    private margin;
    private focusedSelection;
    private focusGroup;
    private constructor();
    private init();
    stripStyles(selector: string): void;
    getBoard(): Selection<Element | Document | EnterElement | Window, {}, null, undefined>;
    getSeatingAreas(): Selection<Element | Document | EnterElement | Window, {}, HTMLElement, {}>;
    getSeatingAreaExposes(): Selection<Element | Document | EnterElement | Window, {}, HTMLElement, {}>;
    getSeats(): Selection<Element | Document | EnterElement | Window, {}, HTMLElement, {}>;
    goToBoard(): void;
    zoom(selection: any, animate?: boolean): void;
    refresh(): void;
    private bindEvents();
    static attach(element: HTMLElement): D3SeatingChart;
}
