import * as d3 from 'd3';
import { Selection, EnterElement } from "d3";

interface IBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IDimensions {
  width: number;
  height: number;
}

export class D3SeatingChart {

  private margin: number = 20;

  private focusedSelection: any;

  private focusGroup: any;

  private history: any[] = [];

  private zoomChangedListeners: Function[] = [];
  
  private constructor(private element: HTMLElement) {}

  private init() {
    let svgSelection = d3.select(this.element);
    let gSelection = svgSelection.select('g');

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
    let svgSelection = d3.select(this.element);
    return svgSelection.select('[type="Board"]');
  }

  public getSeatingAreas() {
    let svgSelection = d3.select(this.element);
    return svgSelection.selectAll('[type="SeatingArea"]');
  }

  public getSeatingAreaExposes() {
    let svgSelection = d3.select(this.element);
    return svgSelection.selectAll('[type="SeatingAreaExpose"]');
  }

  public getSeats() {
    let svgSelection = d3.select(this.element);
    return svgSelection.selectAll('[type="SeatingAreaExpose"] > *:not([type="Static"])');
  }

  public goToBoard() {
    let svgSelection = d3.select(this.element);
    let boardSelection = svgSelection.select('[type="Board"]');

    this.zoom(boardSelection);
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

  public zoom(selection: any, animate: boolean = true) {
    let scaleTransform: string;
    let translateTransform: string;

    let svgSelection = d3.select(this.element);
    let boardSelection = svgSelection.select('[type="Board"]');

    let boundingBox = selection.node().getBBox();

    // register history
    if(selection.node() !== boardSelection.node()) {
      this.history.push(selection);
    } else {
      this.clearHistory();
    }

    // hide other shapes
    let hideSelection: any;
    let showSelection: any;

    let tmpIdentifier = Math.round(Math.random() * 1000000);
    selection.attr('tmp-identifier', tmpIdentifier);

    selection.attr()

    let all = boardSelection.selectAll(`*`);
    let children = selection.selectAll(`[tmp-identifier="${tmpIdentifier}"] > *`);
    
    hideSelection = d3.selectAll(all.nodes().filter((a: any) => {
      return a != boardSelection.node() && a != selection.node() && children.nodes().indexOf(a) == -1 && (a.style.opacity === '' || a.style.opacity === '1');
    }));

    showSelection = svgSelection.selectAll(`[tmp-identifier="${tmpIdentifier}"] > *`);

    // resize
    
    let parentWidth = this.element.clientWidth;
    let parentHeight = this.element.clientHeight;

    let desiredWidth = parentWidth - this.margin*2;
    let desiredHeight = parentHeight - this.margin*2;

    let widthRatio = desiredWidth / boundingBox.width;
    let heightRatio = desiredHeight / boundingBox.height;

    let ratio = Math.min(widthRatio, heightRatio);
    
    scaleTransform = `scale(${ratio})`;
    
    // center
    
    let newX = (this.element.clientWidth/2 - boundingBox.width*ratio/2 - boundingBox.x*ratio);
    let newY = (this.element.clientHeight/2 - boundingBox.height*ratio/2 - boundingBox.y*ratio);

    translateTransform = `translate(${newX},${newY})`;

    let currentTransform = selection.attr('transform');
    if(!currentTransform) {
      currentTransform = 'translate(0, 0)scale(1)';
    }

    // transition
    if(hideSelection) {
      
      hideSelection
        .style('opacity', 1)
        .transition()
        .duration(animate ? 300 : 0)
        .style('opacity', 0)
        .on('end', () => {
          hideSelection.style('pointer-events', 'none');
        });
    }

    if(showSelection) {
      showSelection.transition()
        .style('opacity', 0)
        .duration(animate ? 300 : 0)
        .style('opacity', 1)
        .on('end', () => {
          showSelection.style('pointer-events', 'inherit');
        });
    }

    boardSelection.transition()
      .duration(animate ? 300 : 0)
      .attr('transform', `${translateTransform}${scaleTransform}`);

    this.focusedSelection = selection;

    // notify listeners
    let tmpListeners = this.zoomChangedListeners.concat([]);
    tmpListeners.forEach((listener) => {
      listener();
    });
  }

  public refresh() {
    this.zoom(this.focusedSelection, false);
  }

  private bindEvents() {
    let svgSelection = d3.select(this.element);
    let selection = svgSelection.selectAll('[type="SeatingArea"]');

    selection.on('click', (d) => {
      let ele = d3.event.srcElement;
      let expose = ele.getAttribute('expose');
      if(expose) {
        this.zoom(svgSelection.select(`[name="${expose}"]`))
      }
    });
  }

  static attach(element: HTMLElement) {
    let d3s = new D3SeatingChart(element);
    d3s.init();
    return d3s;
  }
}