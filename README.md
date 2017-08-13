# D3 Seating Chart

A simple but pleasant seating chart written using d3js

![](https://github.com/iamchairs/d3-seating-chart/raw/master/seatingchartexpose.gif "demo")


## Setup


Install


```
npm install d3-seating-chart
```

Attach to the SVG-

HTML
```
<svg id="x" width="640" height="480" xmlns="http://www.w3.org/2000/svg"></svg>
```

JS
```
import { D3SeatingChart } from './D3SeatingChart';

let d3sc = D3SeatingChart.attach(document.getElementById('x'));
```

## SVG Format

There are some rules the svg needs to follow to behave properly.

* Your svg should have a `g` element child with `type="Board"`. All objects that should be affected by transitions should go in here.
* Seating areas should have a `type="SeatingArea"` and an `expose="{name}"` attribute.
* Seats should go in a group (`g`) with a `type="SeatingAreaExpose"` and a `name="{name}"` attribute. The `expose` attribute points to the `name` attribute.

```
<svg id="x" width="640" height="480" xmlns="http://www.w3.org/2000/svg">
  <g type="Board">
  <rect type="Static" id="stage" height="80.38871" width="126.153836" y="206.825647" x="206.459768"/>
  <rect type="SeatingArea" expose="right" height="80.175489" width="57.875103" y="205.119891" x="338.511515"/>
  <rect type="SeatingArea" expose="main" height="95.687786" width="126.854046" y="105.769235" x="206.180359"/>
  <rect type="SeatingArea" expose="left" height="79.962273" width="57.448662" y="205.119891" x="142.930951"/>
  <g type="SeatingAreaExpose" name="left">
    <rect height="14.560438" width="13" y="206.529233" x="158.181482"/>
    ...
  </g>
  <g type="SeatingAreaExpose" name="right">
    <rect height="14.560438" width="13" y="206.529233" x="354.251359"/>
    ...
  </g>
  <g type="SeatingAreaExpose" name="main">
    <rect class="reserved" id="42" height="14.560438" width="13" y="106.863558" x="207.345423"/>
    <rect class="active" id="43" height="14.560438" width="13" y="106.863558" x="221.213018"/>
    <rect height="14.560438" width="13" y="106.809877" x="235.133027"/>
    ...
  </g>
  </g>
</svg>
```

## Styling

This package doesn't do any styling. To style elements you should use plain ol' css.

```
rect[type="Static"] {
  fill: #000;
}

rect[type="SeatingArea"] {
  cursor: pointer;
  fill: #ffffff;
}

g[type="SeatingAreaExpose"] rect {
  fill: #efefef;
}

g[type="SeatingAreaExpose"] .reserved {
  fill: #00bfff;
}

g[type="SeatingAreaExpose"] .active {
  fill: #ffe100;
}

g[type="SeatingAreaExpose"] :not(.active):not(.reserved):hover {
  fill: #ffffff;
  cursor: pointer;
}
```

## Public Methods

**goToBoard**

Returns to the top view of seating areas.

```
document.getElementById('goToBoard').onclick = function() {
  d3sc.goToBoard();
}
```

**refresh**

Resets the position of items inside the csv. You should use this if the svg itself changes size.

```
window.onresize = function() {
  d3sc.refresh();
}
```

**zoom**

Zooms into an element. Makes the element and it's direct children visible. Any element on the board that is not this element or one of it's direct children will be hidden.

```
d3sc.zoom(d3sc.getBoard().select('.the-best-chair')); // animates
d3sc.zoom(d3sc.getBoard().select('.the-best-chair'), false); // does not animate
```

**canGoBack**

All non Board zooms are remembered in a history chain. If you are not at the root level (Board) this will return true.

**goBack**

Will zoom to the last selection in history.

```
if(d3sc.canGoBack()) {
  d3sc.goBack()
}
```

**registerZoomChangeListener**

Register a callback listener for when the zoom is changed. This method return an unregister function.

```
var unreg = d3sc.registerZoomChangeListener(() => {
  console.log('should run once');
  unreg();
});

d3sc.registerZoomChangeListener(() => {
  console.log('should run everytime');
});
```

## Config

When attaching `D3SeatingChart` to an svg, an optional configuration can be passed in.

```
D3SeatingChart.attach(element, { ... config ... });
```

**Options**

|              | Data Type | Default                       | Description                                                                                           |
|--------------|-----------|-------------------------------|-------------------------------------------------------------------------------------------------------|
| showBehavior | enum      | ShowBehavior.DirectDecendants | Changes the show behavior for zooming. Possible values are `All`, `DirectDecendants`, `AllDecendants` |

**ShowBehavior**

Changing the `ShowBehavior` changes the elements that are shown/hidden when zoom is called. This does not affect `pointer-events`.

```
import {D3SeatingChart, ShowBehavior} from 'd3-seating-chart';

D3SeatingChart.attach(element, {
  showBehavior: ShowBehavior.DirectDecendants
});
```

To hide the seating area you can set it's fill color to `transparent`.

```
rect[type="SeatingArea"] {
  cursor: pointer;
  fill: transparent;
}
```

**ShowAll**

![](https://github.com/iamchairs/d3-seating-chart/raw/master/showall.gif "showall")

**AllDecendants**

![](https://github.com/iamchairs/d3-seating-chart/raw/master/showall.gif "alldecendants")

## Events

This package doesn't do any event handling for elements inside the Board. The `D3SeatingChart` class has methods for returning d3 selections.

Elements that are not direct decendants of the zoomed element will have `pointer-events` set to `none`.

```
  d3sc.getBoard().on('click', function() {}); // [type="Board"]
  d3sc.getSeatingAreas().on('click', function() {}); // [type="SeatingArea"]
  d3sc.getSeatingAreaExposes().on('click', function() {}); // [type="SeatingAreaExpose"]
  d3sc.getSeats().on('click', function() {}); // [type=SeatingAreaExpose] < *:not([type="Static"])
```

```
  d3sc.getSeats().on('click', function () {
    let ele = <SVGElement>this;
    if(ele.classList.contains('reserved')) {
      return;
    }

    if(ele.classList.contains('active')) {
      ele.classList.remove('active');
    } else {
      ele.classList.add('active');
    }
  });
```