import { D3SeatingChart } from './D3SeatingChart';
import { ShowBehavior } from "./showBehavior.enum";
import { SelectionChangeEvent } from "./selectionChangeEvent.model";

let d3sc = D3SeatingChart.attach(<any>document.getElementById('x'), {
  showBehavior: ShowBehavior.AllDecendants,
  allowManualSelection: true
});

var unreg = d3sc.registerZoomChangeListener(() => {
  console.log('zoom evt should run once');
  unreg();
});

d3sc.registerZoomChangeListener(() => {
  console.log('zoom evt should run everytime');
});

var unreg2 = d3sc.registerSelectionChangeListener((e: SelectionChangeEvent) => {
  console.log('select evt should run once');
  console.log(e);
  unreg2();
});

d3sc.registerSelectionChangeListener((e: SelectionChangeEvent) => {
  console.log(e);
  console.log('select evt should run everytime');
});

document.getElementById('goToBoard').onclick = function() {
  d3sc.goToBoard();
}

document.getElementById('refresh').onclick = function() {
  d3sc.refresh();
}

document.getElementById('goBack').onclick = function() {
  if(d3sc.canGoBack()) {
    d3sc.goBack();
  } else {
    console.log('you cant go back');
  }
}

document.getElementById('lock').onclick = function() {
  d3sc.lock('[seat="5"]');
}

document.getElementById('unlock').onclick = function() {
  d3sc.unlock('[seat="5"]');
}

document.getElementById('select').onclick = function() {
  d3sc.select('[seat="5"]')
}

document.getElementById('deselect').onclick = function() {
  d3sc.deselect('[seat="5"]')
}

document.getElementById('reserve').onclick = function() {
  d3sc.lock('[seat="5"]', 'reserved');
}

document.getElementById('unreserve').onclick = function() {
  d3sc.unlock('[seat="5"]');
}

document.getElementById('closest1').onclick = function() {
  d3sc.select(d3sc.getClosestSeats('left', 3, false));
}