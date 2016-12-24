
import {
  Component, ViewChild,
  NgZone, OnInit, ElementRef
} from '@angular/core';

import { scaleLinear } from 'd3-scale';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';

import 'rxjs/add/operator/combineLatest';


@Component({
  selector: 'smart-app',
  template: ''
})
export class SmartComponent implements OnInit {

  width = 1280;
  height = 600;
  realMax = 11;
  stream$: Observable<any>;

  @ViewChild('svg') svgRef: ElementRef;

  constructor(private zone: NgZone) {}

  ngOnInit() {

    this.stream$ = Observable
      .fromEvent(this.svgRef.nativeElement, 'mousemove')
      .map((mouseEvent: MouseEvent) => {
        const { offsetX: x, offsetY: y } = mouseEvent;
        const scaleFactor = scaleLinear().domain([this.height, 0]).range([0, .8]);
        const scaleLean = scaleLinear()
          .domain([0, this.width / 2, this.width]).range([.5, 0, -.5]);
        return {
          heightFactor: scaleFactor(y),
          lean: scaleLean(x)
        };
      })
      .startWith({ heightFactor: 0, lean: 0 })
      .combineLatest(Observable.interval(500).take(this.realMax))
      .map(([{ heightFactor, lean }, maxlvl]) => ({
        w: 80,
        heightFactor,
        lean,
        x: this.width / 2 - 40,
        y: this.height - 80,
        lvl: 0,
        maxlvl,
        left: false,
        right: false
      }));

  }




}


















