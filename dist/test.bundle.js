webpackJsonp([0],{

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const D3SeatingChart_1 = __webpack_require__(0);
let d3sc = D3SeatingChart_1.D3SeatingChart.attach(document.getElementById('x'));
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


/***/ })

},[2]);