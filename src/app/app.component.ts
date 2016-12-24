import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { select as d3select, mouse as d3mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  width = 1280;
  height = 600;
  currentMax = 0;
  baseW = 80;
  heightFactor = 0;
  lean = 0;

  running = false;
  realMax = 11;

  @ViewChild('svg') svgRef: ElementRef;

  constructor(private zone: NgZone) { }

  ngOnInit() {
    Observable
      .fromEvent(this.svgRef.nativeElement, 'mousemove')
      .debounceTime(6)
      // .do((event) => console.log(event))
      .subscribe(this.zone.runOutsideAngular(
        () => (ev: MouseEvent) => {
          this.mouseMove(ev.clientX, ev.clientY);
        })
      );


    // d3select(this.svgRef.nativeElement)
    // .on('mousemove', () => this.mouseMove());
    this.next();
  }

  private next() {
  if (this.currentMax < this.realMax) {
    this.currentMax++;
    setTimeout(() => this.next(), 500);
  }
}

  private mouseMove(x, y) {
  // const [x, y] = d3mouse(this.svgRef.nativeElement);
  const scaleFactor = scaleLinear()
    .domain([this.height, 0])
    .range([0, .8]);
  const scaleLean = scaleLinear()
    .domain([0, this.width / 2, this.width])
    .range([.5, 0, -.5]);
  this.heightFactor = scaleFactor(y);
  this.lean = scaleLean(x);
}

}
