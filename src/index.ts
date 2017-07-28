import { D3SeatingChart } from './D3SeatingChart';

let d3sc = D3SeatingChart.attach(<any>document.getElementById('x'));

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

document.getElementById('goToBoard').onclick = function() {
  d3sc.goToBoard();
}