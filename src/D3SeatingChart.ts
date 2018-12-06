import * as d3 from 'd3';
import { Selection, EnterElement } from "d3";

import { InlineStyle } from './style.inline';
import { D3SeatingChartConfig } from './d3SeatingChartConfig.interface';
import { ShowBehavior } from './showBehavior.enum';
import { SelectionChangeEvent, SelectionChangeEventReason } from './selectionChangeEvent.model';
import { BoundingBox } from './boundingBox.interface';

const D3SeatingChartDefaultConfig : D3SeatingChartConfig = {
  showBehavior: ShowBehavior.DirectDecendants,
  allowManualSelection: true
}

export type ElementSelector = SVGElement | SVGElement[] | string;

export class D3SeatingChart {

  public focusedElement: any;

  private history: any[] = [];

  private zoomChangedListeners: Function[] = [];

  private selectionChangeListeners: ((e: SelectionChangeEvent) => void)[] = [];

  private selectedElements: SVGElement[] = [];

  private config: D3SeatingChartConfig;

  private uniqueIdentifier: string;

  private constructor(private element: HTMLElement, private margin: number = 20) {}

  private init(config: D3SeatingChartConfig) {
    let svgSelection = d3.select(this.element);
    let gSelection = svgSelection.select('g');

    this.config = config;

    this.uniqueIdentifier = `d3sc_${Math.round(Math.random()*10000000000)}`;
    this.element.setAttribute(this.uniqueIdentifier, '');

    let style = document.createElement('style');
    style.innerHTML = InlineStyle.replace(/\{@uid\}/g, this.uniqueIdentifier);

    this.element.appendChild(style);

    this.bindEvents();
    this.zoom(gSelection, false);
  }

  public stripStyles(selector: string) {
    let svgSelection = d3.select(this.element);

    svgSelection.selectAll(selector)
      .attr('stroke', null)
      .attr('stroke-width', null)
      .attr('fill', null);
  }

  public getBoard() {
    return this.selectElement('[board]');
  }

  public selectElement(query: string) {
    return d3.select(this.element).select(query);
  }

  public selectElements(query: string) {
    return d3.select(this.element).selectAll(query);
  }

  public goToBoard() {
    this.zoom(this.getBoard());
  }

  public clearHistory() {
    this.history.length = 0;
  }

  public canGoBack() {
    return !!this.history.length;
  }

  public goBack() {
    this.history.pop();

    if(this.history.length) {
      this.zoom(this.history[this.history.length-1]);
    } else {
      this.goToBoard();
    }
  }

  public registerZoomChangeListener(fn: Function) {
    this.zoomChangedListeners.push(fn);

    return () => {
      let idx = this.zoomChangedListeners.indexOf(fn);
      if(idx != -1) {
        this.zoomChangedListeners.splice(idx, 1);
      }
    };
  }

  public registerSelectionChangeListener(fn: (e: SelectionChangeEvent) => void) {
    this.selectionChangeListeners.push(fn);

    return () => {
      let idx = this.selectionChangeListeners.indexOf(fn);
      if(idx != -1) {
        this.selectionChangeListeners.splice(idx, 1);
      }
    };
  }

  public zoom(selection: any, animate: boolean = true) {
    let scaleTransform: string;
    let translateTransform: string;

    let boardSelection = this.getBoard();

    let boundingBox = <BoundingBox>selection.node().getBBox();

    // register history
    if(selection.node() !== boardSelection.node()) {
      if(selection != this.focusedElement) {
        this.history.push(selection);
      }
    } else {
      this.clearHistory();
    }

    // Unset focused element
    this.selectElements('.focused').classed('focused', false);

    // Set new focused element
    selection.classed('focused', true);
    this.focusedElement = selection;

    // get active layer
    let all = boardSelection.selectAll(`*`);
    let activeLayer = selection.selectAll('.focused > *');

    // resize

    let parentWidth = this.element.clientWidth || this.element.getBoundingClientRect().width;
    let parentHeight = this.element.clientHeight || this.element.getBoundingClientRect().height;
    if (!parentWidth || !parentHeight) {
      throw new Error(`SVG dimensions must be positive values. Received width: ${parentWidth} and height: ${parentHeight}`);
    }

    let desiredWidth = parentWidth - this.margin*2;
    let desiredHeight = parentHeight - this.margin*2;

    let widthRatio = desiredWidth / boundingBox.width;
    let heightRatio = desiredHeight / boundingBox.height;

    let ratio = Math.min(widthRatio, heightRatio);

    scaleTransform = `scale(${ratio})`;

    // center

    let newX = (parentWidth / 2 - boundingBox.width * ratio / 2 - boundingBox.x * ratio);
    let newY = (parentHeight / 2 - boundingBox.height * ratio / 2 - boundingBox.y * ratio);

    translateTransform = `translate(${newX},${newY})`;

    let currentTransform = selection.attr('transform');
    if(!currentTransform) {
      currentTransform = 'translate(0, 0)scale(1)';
    }

    // transition
    if(this.config.showBehavior !== ShowBehavior.All) {
      let hideList = this.getHideList(selection);
      let showList = this.getShowList(selection);

      hideList
        .style('opacity', 1)
        .transition()
        .duration(animate ? 300 : 0)
        .style('opacity', 0);

      showList.transition()
        .style('opacity', 0)
        .duration(animate ? 300 : 0)
        .style('opacity', 1);
    }

    //activeLayer.style('pointer-events', 'inherit');

    boardSelection.transition()
      .duration(animate ? 300 : 0)
      .attr('transform', `${translateTransform}${scaleTransform}`);

    // notify listeners
    let tmpListeners = this.zoomChangedListeners.concat([]);
    tmpListeners.forEach((listener) => {
      listener();
    });
  }

  private getShowList(selection: any) {
    if(this.config.showBehavior === ShowBehavior.AllDecendants) {
      return selection.selectAll('.focused *');
    } else {
      return selection.selectAll('.focused > *');
    }
  }

  private getHideList(selection: any) {
    let boardSelection = this.getBoard();
    let all = boardSelection.selectAll(`*`);
    let children: any;

    if(this.config.showBehavior === ShowBehavior.AllDecendants) {
      children = selection.selectAll('.focused *');
    } else {
      children = selection.selectAll('.focused > *');
    }

    return d3.selectAll(all.nodes().filter((a: any) => {
      return a != boardSelection.node() && a != selection.node() && children.nodes().indexOf(a) == -1 && (a.style.opacity === '' || a.style.opacity === '1');
    }));
  }

  public refresh() {
    this.zoom(this.focusedElement, false);
  }

  private bindEvents() {
    let self = this;

    this.selectElements('[zoom-control]').on('click', (d) => {
      let ele = d3.event.srcElement || d3.event.target;
      let expose = ele.getAttribute('zoom-control');

      if(expose) {
        this.zoom(this.selectElement(`[zoom-target="${expose}"]`))
      }
    });

    if(this.config.allowManualSelection) {
      this.selectElements('[seat]').on('click', function () {
        let selectionsChanged = false;

        let ele = <SVGElement>this;

        if(!ele.hasAttribute('locked')) {
          selectionsChanged = true;

          if(ele.hasAttribute('selected')) {
            self.selectedElements.splice(self.selectedElements.findIndex(x => x === ele), 1);
            ele.removeAttribute('selected');
          } else {
            self.selectedElements.push(ele);
            ele.setAttribute('selected', '');
          }
        }

        if(selectionsChanged) {
          self.emitSelectionChangeEvent(SelectionChangeEventReason.SelectionChanged);
        }
      });
    }
  }

  public lock(ele: ElementSelector, c: string = '', emitEvents: boolean = true) {
    let selectionChanges = false;

    ele = this.resolveElements(ele);

    ele.forEach((e) => {
      if(!e.hasAttribute('locked') || e.getAttribute('locked') != c) {
        e.setAttribute('locked', c);

        if(e.hasAttribute('selected')) {
          e.removeAttribute('selected');
          selectionChanges = true;
        }
      }
    });

    if(emitEvents && selectionChanges) {
      this.emitSelectionChangeEvent(SelectionChangeEventReason.LockOverride);
    }
  }

  public unlockAll(c: string = '') {
    if(c) {
      this.unlock(`[locked="${c}"]`);
    } else {
      this.unlock('[locked]');
    }
  }

  public unlock(ele: ElementSelector) {
    ele = this.resolveElements(ele);

    ele.forEach((e) => {
      if(e.hasAttribute('locked')) {
        e.removeAttribute('locked');
      }
    });
  }

  public deselectAll(emitEvents: boolean = true) {
    this.deselect('[selected]', emitEvents);
  }

  public deselect(ele: ElementSelector, emitEvents: boolean = true) {
    let selectionChanges = false;

    ele = this.resolveElements(ele);

    ele.forEach((e) => {
      if(e.hasAttribute('selected')) {
        selectionChanges = true;
        e.removeAttribute('selected');
      }
    });

    if(emitEvents && selectionChanges) {
      this.emitSelectionChangeEvent(SelectionChangeEventReason.SelectionChanged);
    }
  }

  public select(ele: ElementSelector, emitEvents: boolean = true) {
    let selectionChanges = false;

    ele = this.resolveElements(ele);

    ele.forEach((e) => {
      if(!e.hasAttribute('locked')) {
        if(!e.hasAttribute('selected')) {
          selectionChanges = true;
          e.setAttribute('selected', '');
        }
      } else {
        throw new Error('Unable to select element because its locked ' + e.outerHTML);
      }
    });

    if(emitEvents && selectionChanges) {
      this.emitSelectionChangeEvent(SelectionChangeEventReason.SelectionChanged);
    }
  }

  public getClosestSeats(seatingAreaName: string, numSeats: number, contiguous: boolean = true, scatterFallback: boolean = true) {
    let stage = <any>this.selectElement('[stage]');
    let seatingArea = <any>this.selectElement(`[seating-area="${seatingAreaName}"]`);
    let seats = <SVGElement[]>seatingArea.selectAll('[seat]').nodes();

    let stageBBox = <BoundingBox>stage.node().getBBox();
    let seatingAreaBBox = <BoundingBox>seatingArea.node().getBBox();

    let stageCenterX = stageBBox.x + stageBBox.width/2;
    let stageCenterY = stageBBox.y + stageBBox.height/2;

    let seatingAreaCenterX = seatingAreaBBox.x + seatingAreaBBox.width/2;
    let seatingAreaCenterY = seatingAreaBBox.y + seatingAreaBBox.height/2;

    let slopeX = seatingAreaCenterX - stageCenterX;
    let slopeY = seatingAreaCenterY - stageCenterY;

    // 1 = up, 2 = right, 3 = down, 4 = left
    let direction: number;

    if(Math.abs(slopeX) > Math.abs(slopeY)) {
      direction = slopeX < 0 ? 4 : 2;
    } else {
      direction = slopeY < 0 ? 1 : 3;
    }

    let sortedSeats = seats.sort((a, b) => {
      let aX = Math.round(parseFloat(a.getAttribute('x')));
      let aY = Math.round(parseFloat(a.getAttribute('y')));

      let bX = Math.round(parseFloat(b.getAttribute('x')));
      let bY = Math.round(parseFloat(b.getAttribute('y')));

      switch(direction) {
        case 1:
          if(aY < bY) {
            return 1;
          } else if (aY > bY) {
            return -1;
          } else {
            if(aX < bX) {
              return 1;
            } else if (aX > bX) {
              return -1;
            } else {
              return 0;
            }
          }
        case 2:
          if(aX > bX) {
            return 1;
          } else if (aX < bX) {
            return -1;
          } else {
            if(aY > bY) {
              return 1;
            } else if (aY < bY) {
              return -1;
            } else {
              return 0;
            }
          }
        case 3:
          if(aY > bY) {
            return 1;
          } else if (aY < bY) {
            return -1;
          } else {
            if(aX < bX) {
              return 1;
            } else if (aX > bX) {
              return -1;
            } else {
              return 0;
            }
          }
        case 4:
          if(aX < bX) {
            return 1;
          } else if (aX > bX) {
            return -1;
          } else {
            if(aY > bY) {
              return 1;
            } else if(aY < bY) {
              return -1;
            } else {
              return 0;
            }
          }
      }
    });

    if(contiguous) {
      let sections: Array<SVGElement[]> = [];
      let sortedSeatsCopy = sortedSeats.concat([]);

      let j = 0;
      do {
        j++;
        let br = -1;

        let lastSeat;

        for(let i = 0; i < sortedSeatsCopy.length; i++) {
          let seat = sortedSeatsCopy[i];

          if(seat.hasAttribute('locked')) {
            br = i;
            sortedSeatsCopy.splice(i, 1);
            break;
          } else if(lastSeat) {

            if(direction === 1 || direction === 3) {
              let lsY = Math.round(parseFloat(lastSeat.getAttribute('y')));
              let sY = Math.round(parseFloat(seat.getAttribute('y')));

              if(lsY != sY) {
                br = i;
                break;
              }
            } else {
              let lsX = Math.round(parseFloat(lastSeat.getAttribute('x')));
              let sX = Math.round(parseFloat(seat.getAttribute('x')));

              if(lsX != sX) {
                br = i;
                break;
              }
            }
          }

          lastSeat = seat;
        }

        if(br == -1) {
          sections.push(sortedSeatsCopy.splice(0, sortedSeatsCopy.length));
        } else {
          sections.push(sortedSeatsCopy.splice(0, br));
        }
      } while(sortedSeatsCopy.length && j < 20);

      for(let i = 0; i < sections.length; i++) {
        let section = sections[i];

        if(section.length >= numSeats) {
          return section.splice(0, numSeats);
        }
      }
    }

    if(!contiguous || scatterFallback) {
      return sortedSeats.filter(x => !x.hasAttribute('locked')).splice(0, numSeats);
    }

    return [];
  }

  private emitSelectionChangeEvent(r: SelectionChangeEventReason) {
    // notify listeners
    let tmpListeners = this.selectionChangeListeners.concat([]);
    tmpListeners.forEach((listener) => {
      listener({
        reason: r,
        selection: this.selectedElements.concat([])
      });
    });
  }

  private resolveElements(ele: ElementSelector): SVGElement[] {
    if(typeof(ele) === 'string') {
      ele = <SVGElement[]>this.selectElements(ele).nodes();
    } else if(!(ele instanceof Array)) {
      ele = [ele];
    }

    return ele;
  }

  static attach(element: HTMLElement, config: D3SeatingChartConfig = D3SeatingChartDefaultConfig, margin: number = 20) {
    let d3s = new D3SeatingChart(element, margin);
    d3s.init(config);
    return d3s;
  }
}
