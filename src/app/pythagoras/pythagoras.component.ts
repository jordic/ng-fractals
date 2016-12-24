import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit, OnChanges } from '@angular/core';
import { interpolateViridis } from 'd3-scale';

function deg(radians) {
  return radians * (180 / Math.PI);
};

const memoizedCalc = function (): (any) => { nextRight: number, nextLeft: number, A: number, B: number } {
  const memo = {};

  const key = ({ w, heightFactor, lean }) => [w, heightFactor, lean].join('-');

  return (args) => {
    const memoKey = key(args);

    if (memo[memoKey]) {
      return memo[memoKey];
    } else {
      const { w, heightFactor, lean } = args;

      const trigH = heightFactor * w;

      const result = {
        nextRight: Math.sqrt(trigH ** 2 + (w * (.5 + lean)) ** 2),
        nextLeft: Math.sqrt(trigH ** 2 + (w * (.5 - lean)) ** 2),
        A: deg(Math.atan(trigH / ((.5 - lean) * w))),
        B: deg(Math.atan(trigH / ((.5 + lean) * w)))
      };

      memo[memoKey] = result;
      return result;
    }
  }
} ();

@Component({
  selector: '[app-pythagoras]',
  templateUrl: './pythagoras.component.html',
  styleUrls: ['./pythagoras.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PythagorasComponent  {

  w: number = 80;
  x: number;
  y: number;
  heightFactor: number;
  lean: number;
  left: boolean;
  right: boolean;
  lvl: number;
  maxlvl: number;

  sL: any;
  sR: any;

  // @Input()
  // s: any;

  nextRight: number;
  nextLeft: number;
  A: number;
  B: number;

  // ngOnChanges() {
  @Input()
  set s(s:any) {
    Object.assign(this, s);
    const calc = memoizedCalc({
      w: this.w,
      heightFactor: this.heightFactor,
      lean: this.lean
    });
    this.nextRight = calc.nextRight;
    this.nextLeft = calc.nextLeft;
    this.A = calc.A;
    this.B = calc.B;

    this.sR = Object.assign({}, this.s, {
      w: this.nextRight,
      x: this.w = this.nextRight,
      y: -this.nextRight,
      lvl: this.lvl + 1,
      right: true
    });

    this.sL = Object.assign({}, this.s, {
      w: this.nextLeft,
      x: 0,
      y: -this.nextLeft,
      lvl: this.lvl + 1,
      left: true
    });

  }

  @HostBinding('attr.transform') get transform() {
    return `translate(${this.x} ${this.y}) ${this.getRotate()}`;
  }

  private getRotate() {
    if (this.left) {
      return `rotate(${-this.A} 0 ${this.w})`;
    } else if (this.right) {
      return `rotate(${this.B} ${this.w} ${this.w})`;
    } else {
      return '';
    }
  }

  getFill() {
    return interpolateViridis(this.lvl / this.maxlvl);
  }
}
