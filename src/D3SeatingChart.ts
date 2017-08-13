import * as d3 from 'd3';
import { Selection, EnterElement } from "d3";

import { InlineStyle } from './style.inline';

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

export enum ShowBehavior {
  All = 1,
  DirectDecendants,
  AllDecendants
}

export interface D3SeatingChartConfig {
  showBehavior: ShowBehavior;
}

const D3SeatingChartDefaultConfig : D3SeatingChartConfig = {
  showBehavior: ShowBehavior.DirectDecendants
}

export class D3SeatingChart {

  private margin: number = 20;

  public focusedElement: any;

  private history: any[] = [];

  private zoomChangedListeners: Function[] = [];

  private config: D3SeatingChartConfig;

  private uniqueIdentifier: string;
  
  private constructor(private element: HTMLElement) {}

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

    // Unset focused element
    svgSelection.selectAll('.focused').classed('focused', false);

    // Set new focused element
    selection.classed('focused', true);
    this.focusedElement = selection;

    // register history
    if(selection.node() !== boardSelection.node()) {
      this.history.push(selection);
    } else {
      this.clearHistory();
    }

    // get active layer
    let all = boardSelection.selectAll(`*`);
    let activeLayer = selection.selectAll('.focused > *');

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

  private getInverse(selection: any) {

  }

  private getShowList(selection: any) {
    if(this.config.showBehavior === ShowBehavior.AllDecendants) {
      return selection.selectAll('.focused *');
    } else {
      return selection.selectAll('.focused > *');
    }
  }

  private getHideList(selection: any) {
    let svgSelection = d3.select(this.element);
    let boardSelection = svgSelection.select('[type="Board"]');
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

  static attach(element: HTMLElement, config: D3SeatingChartConfig = D3SeatingChartDefaultConfig) {
    let d3s = new D3SeatingChart(element);
    d3s.init(config);
    return d3s;
  }
}