import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, HostBinding, Input
} from '@angular/core';
import { interpolateViridis } from 'd3-scale';

function deg(radians: number) {
  return Math.round((radians * (180 / Math.PI)) * 10) / 10;
}


const fills = {};
export function memoizeFill(level) {
  if (fills[level]) {
    return fills[level];
  }
  fills[level] = interpolateViridis(level);
  return fills[level];
}


const memoizedCalc = function (): (x: any) => { nextRight: number, nextLeft: number, A: number, B: number } {
  const memo = {};

  const key = ({ w, heightFactor, lean }: PythagorasArgs) => [w, heightFactor, lean].join('-');

  return (args: PythagorasArgs) => {
    const memoKey = key(args);

    if (memo[memoKey]) {
      return memo[memoKey];
    } else {
      const { w, heightFactor, lean } = args;

      const trigH = heightFactor * w;

      const result = {
        nextRight: Math.round(Math.sqrt(trigH ** 2 + (w * (.5 + lean)) ** 2) * 10) / 10,
        nextLeft: Math.round(Math.sqrt(trigH ** 2 + (w * (.5 - lean)) ** 2) * 10) / 10,
        A: deg(Math.atan(trigH / ((.5 - lean) * w))),
        B: deg(Math.atan(trigH / ((.5 + lean) * w)))
      };

      memo[memoKey] = result;
      return result;
    }
  }
} ();

export interface PythagorasArgs {
  w: number;
  heightFactor: number;
  lean: number;
  x: number;
  y: number;
  lvl: number;
  maxlvl: number;
  left?: boolean;
  right?: boolean;
}


@Component({
  selector: '[app-pythagoras]',
  templateUrl: './pythagoras.component.html',
  styleUrls: ['./pythagoras.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PythagorasComponent {

  rotate: string = '';
  leftArgs: PythagorasArgs;
  rightArgs: PythagorasArgs;
  current: PythagorasArgs;

  constructor(private cr: ChangeDetectorRef) {
    cr.detach();
  }

  @Input()
  set s(s: PythagorasArgs) {

    // console.log(s)
    if (!s) {
      return;
    }

    if (s.w < 2) {
      return;
    }

    // console.log(s)
    this.current = s;
    // console.log(this.current)
    const { nextRight, nextLeft, A, B } = memoizedCalc({
      w: Math.round(s.w * 10) / 10,
      heightFactor: Math.round(s.heightFactor * 100) / 100,
      lean: Math.round(s.lean * 100) / 100
    });

    if (s.left) {
      this.rotate = `rotate(${-A} 0 ${s.w})`;
    } else if (s.right) {
      this.rotate = `rotate(${B} ${s.w} ${s.w})`;
    }

    this.leftArgs = {
      w: nextLeft,
      x: 0,
      y: -nextLeft,
      lvl: s.lvl + 1,
      maxlvl: s.maxlvl,
      heightFactor: s.heightFactor,
      lean: s.lean,
      left: true
    };

    this.rightArgs = {
      w: nextRight,
      x: s.w - nextRight,
      y: -nextRight,
      lvl: s.lvl + 1,
      maxlvl: s.maxlvl,
      heightFactor: s.heightFactor,
      lean: s.lean,
      right: true
    };

  }

  @HostBinding('attr.transform') get transform() {
    if (this.current && this.current.lvl < this.current.maxlvl) {
      return `translate(${this.current.x} ${this.current.y}) ${this.rotate}`;
    }
    return `translate(0 0) rotate(0 0 0)`;
  }

  getFill() {
    if (this.current && this.current.w) {
      return memoizeFill(this.current.lvl / this.current.maxlvl);
    }
  }
}


