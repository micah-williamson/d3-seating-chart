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

## 2.1.0

**Changes**

* added `getClosestSeats` method

## 2.0.0

**Breaking Changes**

* `type="Board"` changed to attribute `board`
* add `stage` attribute to stage element
* `type="SeatingArea" name="main"` changed to `zoom-control="main"`
* `type="SeatingChartExpose" name="main"` change to `seating-area zoom-target="main"`
* public methods `getSeatingAreas`, `getSeats` removed. use `selectElement`, and `selectElements` with a dom query selector
* this library now implements seat selection logic instead of leaving that up to you

**Changes**

* added `registerSelectionChangeListener` method
* added `select`, `deselect`, `lock`, `unlock` methods
* added `allowManualSelection` to config

## Try It

Clone this repo. Run `webpack -w`

## SVG Format

There are some rules the svg needs to follow to behave properly. Don't worry about positioning your svg perfectly in the center, this library will zoom/position the
board so that it fills the svg dimensions with a margin.

To get the svg seen in the examples, I used http://editor.method.ac/

* Your svg should have a `g` element child with a `board` attribute. All objects that should be affected by transitions should go in here.
* Your stage element should have a `stage` attribute.
* Seating areas should have a `seating-area` attribute.
* Seats should have a `seat` attribute.
* Use zoom controls with `zoom-control="{targetName}"` and `zoom-target="{targetName}"`

```
<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
     <g board>
      <rect stage height="80.38871" width="126.153836" y="206.825647" x="206.459768"/>
      <rect zoom-control="right" height="80.175489" width="57.875103" y="205.119891" x="338.511515"/>
      <rect zoom-control="main" height="95.687786" width="126.854046" y="105.769235" x="206.180359"/>
      <rect zoom-control="left" height="79.962273" width="57.448662" y="205.119891" x="142.930951"/>
      <g seating-area zoom-target="left">
       <rect selected seat height="14.560438" width="13" y="206.529233" x="158.181482"/>
       <rect locked seat height="14.560438" width="13" y="206.529233" x="172.049076"/>
       <rect locked="reserved" seat height="14.560438" width="13" y="206.475552" x="185.969085"/>
       
      ...

      </g>
      <g seating-area zoom-target="right">
       <rect seat height="14.560438" width="13" y="206.529233" x="354.251359"/>
       <rect seat height="14.560438" width="13" y="206.529233" x="368.118954"/>
       <rect seat height="14.560438" width="13" y="206.475552" x="382.038963"/>
       
      ...

      </g>
      <g seating-area zoom-target="main">
       <rect seat class="reserved" height="14.560438" width="13" y="106.863558" x="207.345423"/>
       <rect seat class="locked" height="14.560438" width="13" y="106.863558" x="221.213018"/>
       <rect seat height="14.560438" width="13" y="106.809877" x="235.133027"/>
       
      ...

      </g>
     </g>
    </svg>
```

## Styling

This package doesn't do any styling. To style elements you should use plain ol' css.

```
body {
  background-color: #1d74aa;
}

svg {
  border: 1px solid #000;
}

[stage] {
  fill: #000;
}

[zoom-control] {
  cursor: pointer;
  fill: transparent;
}

[seat] {
  fill: #efefef;
}

[seat][locked] {
  fill: #888888;
}

[seat][locked="reserved"] {
  fill: #00bfff;
}

[seat][selected] {
  fill: #ffe100;
}

[seat]:not([selected]):not([locked]):hover {
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

**select(elementSelector, emitEvents = true)**

Selects the given set of seats. Can be given a single element, an array of elements, or a dom query selector.
If the selection contains a seat that is `locked` or `reserved` and error will be thrown.
If the selected seats actually change, an event will be emitted.

```
d3sc.select(element1);
d3sc.select([element1, element2]);
d3sc.select('[seat="10"]');
```

**deselect**

Deselects the given set of seats. Can be given a single element, an array of elements, or a dom query selector.
If the selected seats actually change, an event will be emitted.

```
d3sc.deselect(element1);
d3sc.deselect([element1, element2]);
d3sc.deselect('[seat="10"]');
```

**deselectAll**

Deselects all selected seats.

**lock(elementSelector, class = '', emitEvents = true)**

Locks the given set of seats. Can be given a single element, an array of elements, or a dom query selector.
If the selection contains seats that are already selected, the will be force locked and a change event will be emitted with the `LockOverride` reason.

```
d3sc.lock(element1);
d3sc.lock([element1, element2]);
d3sc.lock('[seat="10"]');
d3sc.lock(element1, "reserved");
d3sc.lock([element1, element2], "reserved");
d3sc.lock('[seat="10"]', "reserved");
```

**unlockAll(class = '')**

Unlocks all locked seats. Given a class, only unlocks seats of that given class. e.g. `unlockAll('reserved')`

**unlock**

Unlocks the given set of seats. Can be given a single element, an array of elements, or a dom query selector.

```
d3sc.unlock(element1);
d3sc.unlock([element1, element2]);
d3sc.unlock('[seat="10"]');
```

**selectElement**

Given a dom query selector, returns the **first** element within the svg that matches the query selector. *See d3js select*

```
d3sc.selectElement('[seat="10"]');
```

**selectElements**

Given a dom query selector, returns the elements within the svg that matches the query selector. *See d3js selectAll*

```
d3sc.selectElements('[seat]');
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
d3sc.zoom(d3sc.selectElement('.the-best-chair')); // animates
d3sc.zoom(d3sc.selectElement('.the-best-chair'), false); // does not animate
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

## Config

When attaching `D3SeatingChart` to an svg, an optional configuration can be passed in.

```
D3SeatingChart.attach(element, { ... config ... });
```

**Options**

|              | Data Type | Default                       | Description                                                                                           |
|--------------|-----------|-------------------------------|-------------------------------------------------------------------------------------------------------|
| showBehavior | enum      | ShowBehavior.DirectDecendants | Changes the show behavior for zooming. Possible values are `All`, `DirectDecendants`, `AllDecendants` |
| allowManualSelection | boolean      | true | Implements manual seat selection seen in the demo |

## ShowBehavior

Changing the `ShowBehavior` changes the elements that are shown/hidden when zoom is called. This does not affect `pointer-events`.

```
import {D3SeatingChart, ShowBehavior, SelectionBehavior} from 'd3-seating-chart';

D3SeatingChart.attach(element, {
  showBehavior: ShowBehavior.DirectDecendants,
  allowManualSelection: true
});
```

To hide the seating area you can set it's fill color to `transparent`.

```
[seating-area] {
  cursor: pointer;
  fill: transparent;
}
```

**ShowAll**

![](https://github.com/iamchairs/d3-seating-chart/raw/master/showall.gif "showall")

**AllDecendants**

![](https://github.com/iamchairs/d3-seating-chart/raw/master/alldecendants.gif "alldecendants")

## Events

This package is built using `d3js` which provides events for svg elements. You can use the `selectElement` and `selectElements` methods to get the
d3 elements themselves. With those, you can bind events using d3.

Elements that are not direct decendants of the zoomed element will have `pointer-events` set to `none`.

```
  d3sc.getBoard().on('click', function() {});

  d3sc.getElement('#myCustomEvent').on('click', function() {
    console.log(this); // the element
  });

  d3sc.getElements('[seat]').on('click', function() {
    console.log(this); // the element
  });
```

However, there are some d3SeatingChart events.

**zoom change**

Register a callback listener for when the zoom is changed. This method returns an unregister function.

```
var unreg = d3sc.registerZoomChangeListener(() => {
  console.log('should run once');
  unreg();
});

d3sc.registerZoomChangeListener(() => {
  console.log('should run everytime');
});
```

**selection change**

Register a callback listener for when the seat selection is changed. This method return an unregister function.

The `SelectChangeEvent` sends the list of selected seats (not just the changes). It also sends the reason for the change.
If `select` is used then the reason will be `SelectionChanged`. If the selection has changed because a `lock` was set,
then the reason will be `LockOverride`. This is useful if updating locks/reservations can overwrite the users selection at
runtime- at which point the user should be notified in some way.

```
import { SelectionChangeEvent, SelectionChangeEventReason } from 'd3-seating-chart';

var unreg = d3sc.registerSelectionChangeListener((e: SelectionChangeEvent) => {
  console.log('select evt should run once');
  unreg();
});

d3sc.registerSelectionChangeListener((e: SelectionChangeEvent) => {
  console.log(e.selection); // All current selections

  if(e.reason === SelectionChangeEventReason.SelectionChanged) {
    console.log('number of selected seats: ' + e.selection.length)
  } else if (e.reason === SelectionChangeEventReason.LockOverride) {
    alert('Some of the seats you had selected are now taken.');
  }
});
```

## Get Closest Seats

In some cases you may not want to give the user the option to select seats but auto assign them seats closest to the stage.
This is used to prevent holes in the audience due to users giving themselves a one seat buffer between their group and others.

This method looks at the seating area in relation to the stage and determines if it's above, right of, below, or left of the stage.
With that it "knows" which seats are closest to the stage and automatically sorts them. This method will always return as many seats
it can match even if the amount of seats it finds does not equal the requested `numSeats`. You should account for this in your implementation.

This method allows specifying whether to search for `contiguous` seating, where it will attempt to only match adjacent seats. If not
enough adjacent seats are found, and `scatterFallback` is set to `true`, it will select the closest seats possible and ignore the
contiguous rule. If `scatterFallback` is `false` in this scenario, an empty array will be returned.

**getClosestSeats(seatingArea, numSeats, contiguous = true, scatterFallback = true)**

```
d3sc.select(d3sc.getClosestSeats('left', 3));
```

![](https://github.com/iamchairs/d3-seating-chart/raw/master/cs1.PNG "closestseats")

```
d3sc.select(d3sc.getClosestSeats('left', 3))
```

![](https://github.com/iamchairs/d3-seating-chart/raw/master/cs2.PNG "closestseats2")

```
d3sc.select(d3sc.getClosestSeats('left', 3, false))
```

![](https://github.com/iamchairs/d3-seating-chart/raw/master/cs5.PNG "closestseats5")

```
d3sc.select(d3sc.getClosestSeats('left', 5))
```

![](https://github.com/iamchairs/d3-seating-chart/raw/master/cs3.PNG "closestseats3")

```
d3sc.select(d3sc.getClosestSeats('left', 8))
```

![](https://github.com/iamchairs/d3-seating-chart/raw/master/cs4.PNG "closestseats4")