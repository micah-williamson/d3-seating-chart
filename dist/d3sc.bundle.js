webpackJsonp([1],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __webpack_require__(1);
class D3SeatingChart {
    constructor(element) {
        this.element = element;
        this.margin = 20;
    }
    init() {
        let svgSelection = d3.select(this.element);
        let gSelection = svgSelection.select('g');
        this.bindEvents();
        this.zoom(gSelection, false);
    }
    stripStyles(selector) {
        let svgSelection = d3.select(this.element);
        svgSelection.selectAll(selector)
            .attr('stroke', null)
            .attr('stroke-width', null)
            .attr('fill', null);
    }
    getBoard() {
        let svgSelection = d3.select(this.element);
        return svgSelection.select('[type="Board"]');
    }
    getSeatingAreas() {
        let svgSelection = d3.select(this.element);
        return svgSelection.selectAll('[type="SeatingArea"]');
    }
    getSeatingAreaExposes() {
        let svgSelection = d3.select(this.element);
        return svgSelection.selectAll('[type="SeatingAreaExpose"]');
    }
    getSeats() {
        let svgSelection = d3.select(this.element);
        return svgSelection.selectAll('[type="SeatingAreaExpose"] > *:not([type="Static"])');
    }
    goToBoard() {
        let svgSelection = d3.select(this.element);
        let boardSelection = svgSelection.select('[type="Board"]');
        this.zoom(boardSelection);
    }
    zoom(selection, animate = true) {
        let scaleTransform;
        let translateTransform;
        let svgSelection = d3.select(this.element);
        let boardSelection = svgSelection.select('[type="Board"]');
        let boundingBox = selection.node().getBBox();
        let hideSelection;
        let showSelection;
        let tmpIdentifier = Math.round(Math.random() * 1000000);
        selection.attr('tmp-identifier', tmpIdentifier);
        selection.attr();
        let all = boardSelection.selectAll(`*`);
        let children = selection.selectAll(`[tmp-identifier="${tmpIdentifier}"] > *`);
        hideSelection = d3.selectAll(all.nodes().filter((a) => {
            return a != boardSelection.node() && a != selection.node() && children.nodes().indexOf(a) == -1 && (a.style.opacity === '' || a.style.opacity === '1');
        }));
        showSelection = svgSelection.selectAll(`[tmp-identifier="${tmpIdentifier}"] > *`);
        let parentWidth = this.element.clientWidth;
        let parentHeight = this.element.clientHeight;
        let desiredWidth = parentWidth - this.margin * 2;
        let desiredHeight = parentHeight - this.margin * 2;
        let widthRatio = desiredWidth / boundingBox.width;
        let heightRatio = desiredHeight / boundingBox.height;
        let ratio = Math.min(widthRatio, heightRatio);
        scaleTransform = `scale(${ratio})`;
        let newX = (this.element.clientWidth / 2 - boundingBox.width * ratio / 2 - boundingBox.x * ratio);
        let newY = (this.element.clientHeight / 2 - boundingBox.height * ratio / 2 - boundingBox.y * ratio);
        translateTransform = `translate(${newX},${newY})`;
        let currentTransform = selection.attr('transform');
        if (!currentTransform) {
            currentTransform = 'translate(0, 0)scale(1)';
        }
        if (hideSelection) {
            hideSelection
                .style('opacity', 1)
                .transition()
                .duration(animate ? 300 : 0)
                .style('opacity', 0)
                .on('end', () => {
                hideSelection.style('pointer-events', 'none');
            });
        }
        if (showSelection) {
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
    }
    refresh() {
        this.zoom(this.focusedSelection, false);
    }
    bindEvents() {
        let svgSelection = d3.select(this.element);
        let selection = svgSelection.selectAll('[type="SeatingArea"]');
        selection.on('click', (d) => {
            let ele = d3.event.srcElement;
            let expose = ele.getAttribute('expose');
            if (expose) {
                this.zoom(svgSelection.select(`[name="${expose}"]`));
            }
        });
    }
    static attach(element) {
        let d3s = new D3SeatingChart(element);
        d3s.init();
        return d3s;
    }
}
exports.D3SeatingChart = D3SeatingChart;


/***/ })
],[0]);