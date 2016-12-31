
import { AsyncAction } from 'rxjs/scheduler/AsyncAction';
import { AsyncScheduler } from 'rxjs/scheduler/AsyncScheduler';


declare var window: any;

export class RequestIdleScheduler extends AsyncScheduler {
  public flush(action?: AsyncAction<any>): void {

    this.active = true;
    this.scheduled = undefined;

    const {actions} = this;
    let error: any;
    let index: number = -1;
    let count: number = actions.length;
    action = action || actions.shift();

    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (++index < count && (action = actions.shift()));

    this.active = false;

    if (error) {
      while (++index < count && (action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}

// import { RequestIdleScheduler } from './RequestIdleScheduler';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class RequestIdleAction<T> extends AsyncAction<T> {

  constructor(protected scheduler: RequestIdleScheduler,
    protected work: (this: RequestIdleAction<T>, state?: T) => void) {
    super(scheduler, work);
  }

  protected requestAsyncId(scheduler: RequestIdleScheduler, id?: any, delay: number = 0): any {
    // If delay is greater than 0, request as an async action.
    if (delay !== null && delay > 0) {
      return super.requestAsyncId(scheduler, id, delay);
    }
    // Push the action to the end of the scheduler queue.
    scheduler.actions.push(this);
    // If an animation frame has already been requested, don't request another
    // one. If an animation frame hasn't been requested yet, request one. Return
    // the current animation frame request id.
    return scheduler.scheduled || (scheduler.scheduled = window.requestIdleCallback(
      scheduler.flush.bind(scheduler, null)
    ));
  }
  protected recycleAsyncId(scheduler: RequestIdleScheduler, id?: any, delay: number = 0): any {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action.
    if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
      return super.recycleAsyncId(scheduler, id, delay);
    }
    // If the scheduler queue is empty, cancel the requested animation frame and
    // set the scheduled flag to undefined so the next RequestIdleAction will
    // request its own.
    if (scheduler.actions.length === 0) {
      window.cancelIdleCallback(id);
      // AnimationFrame.cancelAnimationFrame(id);
      scheduler.scheduled = undefined;
    }
    // Return undefined so the action knows to request a new async id if it's rescheduled.
    return undefined;
  }
}


export const requestIdle = new RequestIdleScheduler(RequestIdleAction);
