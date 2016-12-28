import {
  Component, ElementRef, OnInit,
  ViewChild, NgZone, ChangeDetectionStrategy, ChangeDetectorRef, ApplicationRef
} from '@angular/core';
import { scaleLinear } from 'd3-scale';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/combineLatest';

// import { animationFrame } from 'rxjs/scheduler/animationFrame';

// export function filter(x: MouseEvent, y: MouseEvent): boolean {
//   const dx = Math.abs(x.offsetX - y.offsetX);
//   const dy = Math.abs(x.offsetY - y.offsetY);
//   return ((dx + dy) >= 10 ? false : true);
// }

/*
(x: MouseEvent, y: MouseEvent) => {
          return (Math.round(x.offsetX) === Math.round(y.offsetX) ||
            Math.round(x.offsetY) === Math.round(y.offsetY));
        }
*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  width = 1280;
  height = 600;
  currentMax = 0;
  baseW = 80;
  heightFactor = 0;
  lean = 0;
  stream$: Observable<any>;
  realMax = 11;

  @ViewChild('svg') svgRef: ElementRef;

  constructor(
    private zone: NgZone,
    private cr: ChangeDetectorRef) {
      // this.cr.detach();
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.stream$ = Observable
        .fromEvent(this.svgRef.nativeElement, 'mousemove')
        // .distinctUntilChanged(filter)
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
        .switchMap(([{ heightFactor, lean }, maxlvl]) => (Observable.of({
          w: 80,
          heightFactor,
          lean,
          x: this.width / 2 - 40,
          y: this.height - 80,
          lvl: 0,
          maxlvl: maxlvl + 1,
          left: false,
          right: false
        })));
    });
  }

}
