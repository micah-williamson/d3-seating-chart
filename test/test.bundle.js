webpackJsonp([0,1],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __webpack_require__(1);
const style_inline_1 = __webpack_require__(2);
var ShowBehavior;
(function (ShowBehavior) {
    ShowBehavior[ShowBehavior["All"] = 1] = "All";
    ShowBehavior[ShowBehavior["DirectDecendants"] = 2] = "DirectDecendants";
    ShowBehavior[ShowBehavior["AllDecendants"] = 3] = "AllDecendants";
})(ShowBehavior = exports.ShowBehavior || (exports.ShowBehavior = {}));
const D3SeatingChartDefaultConfig = {
    showBehavior: ShowBehavior.DirectDecendants
};
class D3SeatingChart {
    constructor(element) {
        this.element = element;
        this.margin = 20;
        this.history = [];
        this.zoomChangedListeners = [];
    }
    init(config) {
        let svgSelection = d3.select(this.element);
        let gSelection = svgSelection.select('g');
        this.config = config;
        this.uniqueIdentifier = `d3sc_${Math.round(Math.random() * 10000000000)}`;
        this.element.setAttribute(this.uniqueIdentifier, '');
        let style = document.createElement('style');
        style.innerHTML = style_inline_1.InlineStyle.replace(/\{@uid\}/g, this.uniqueIdentifier);
        this.element.appendChild(style);
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
    clearHistory() {
        this.history.length = 0;
    }
    canGoBack() {
        return !!this.history.length;
    }
    goBack() {
        this.history.pop();
        if (this.history.length) {
            this.zoom(this.history[this.history.length - 1]);
        }
        else {
            this.goToBoard();
        }
    }
    registerZoomChangeListener(fn) {
        this.zoomChangedListeners.push(fn);
        return () => {
            let idx = this.zoomChangedListeners.indexOf(fn);
            if (idx != -1) {
                this.zoomChangedListeners.splice(idx, 1);
            }
        };
    }
    zoom(selection, animate = true) {
        let scaleTransform;
        let translateTransform;
        let svgSelection = d3.select(this.element);
        let boardSelection = svgSelection.select('[type="Board"]');
        let boundingBox = selection.node().getBBox();
        if (selection.node() !== boardSelection.node()) {
            if (selection != this.focusedElement) {
                this.history.push(selection);
            }
        }
        else {
            this.clearHistory();
        }
        svgSelection.selectAll('.focused').classed('focused', false);
        selection.classed('focused', true);
        this.focusedElement = selection;
        let all = boardSelection.selectAll(`*`);
        let activeLayer = selection.selectAll('.focused > *');
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
        if (this.config.showBehavior !== ShowBehavior.All) {
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
        boardSelection.transition()
            .duration(animate ? 300 : 0)
            .attr('transform', `${translateTransform}${scaleTransform}`);
        let tmpListeners = this.zoomChangedListeners.concat([]);
        tmpListeners.forEach((listener) => {
            listener();
        });
    }
    getInverse(selection) {
    }
    getShowList(selection) {
        if (this.config.showBehavior === ShowBehavior.AllDecendants) {
            return selection.selectAll('.focused *');
        }
        else {
            return selection.selectAll('.focused > *');
        }
    }
    getHideList(selection) {
        let svgSelection = d3.select(this.element);
        let boardSelection = svgSelection.select('[type="Board"]');
        let all = boardSelection.selectAll(`*`);
        let children;
        if (this.config.showBehavior === ShowBehavior.AllDecendants) {
            children = selection.selectAll('.focused *');
        }
        else {
            children = selection.selectAll('.focused > *');
        }
        return d3.selectAll(all.nodes().filter((a) => {
            return a != boardSelection.node() && a != selection.node() && children.nodes().indexOf(a) == -1 && (a.style.opacity === '' || a.style.opacity === '1');
        }));
    }
    refresh() {
        this.zoom(this.focusedElement, false);
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
    static attach(element, config = D3SeatingChartDefaultConfig) {
        let d3s = new D3SeatingChart(element);
        d3s.init(config);
        return d3s;
    }
}
exports.D3SeatingChart = D3SeatingChart;


/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineStyle = `
  [{@uid}] * {
    pointer-events: none;
  }

  [{@uid}] .focused, svg .focused > * {
    pointer-events: initial;
  }
`;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const D3SeatingChart_1 = __webpack_require__(0);
let d3sc = D3SeatingChart_1.D3SeatingChart.attach(document.getElementById('x'), {
    showBehavior: D3SeatingChart_1.ShowBehavior.AllDecendants
});
var unreg = d3sc.registerZoomChangeListener(() => {
    console.log('should run once');
    unreg();
});
d3sc.registerZoomChangeListener(() => {
    console.log('should run everytime');
});
d3sc.getSeats().on('click', function () {
    let ele = this;
    if (ele.classList.contains('reserved')) {
        return;
    }
    if (ele.classList.contains('active')) {
        ele.classList.remove('active');
    }
    else {
        ele.classList.add('active');
    }
});
document.getElementById('goToBoard').onclick = function () {
    d3sc.goToBoard();
};
document.getElementById('refresh').onclick = function () {
    d3sc.refresh();
};
document.getElementById('goBack').onclick = function () {
    if (d3sc.canGoBack()) {
        d3sc.goBack();
    }
    else {
        console.log('you cant go back');
    }
};


/***/ })
],[3]);