import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, HostBinding, Input
} from '@angular/core';
import { interpolateViridis } from 'd3-scale';

function deg(radians: number) {
  return radians * (180 / Math.PI);
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
    this.cr.detach();
  }

  @Input()
  set s(s: PythagorasArgs) {

    // console.log(s)
    if (!s) {
      return;
    }
    if (s.lvl >= s.maxlvl || s.w < 1) {
      return;
    }

    // console.log(s)
    this.current = s;

    const { nextRight, nextLeft, A, B } = memoizedCalc({
      w: s.w,
      heightFactor: s.heightFactor,
      lean: s.lean
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
    if (this.current) {
      return `translate(${this.current.x} ${this.current.y}) ${this.rotate}`;
    }
    return `translate(0 0) rotate(0 0 0)`;
  }

  getFill() {
    if (this.current) {
      return interpolateViridis(this.current.lvl / this.current.maxlvl);
    }
  }
}


