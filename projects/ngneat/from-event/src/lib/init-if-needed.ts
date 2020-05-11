import { Subject } from 'rxjs';
import { finalize, refCount, publish } from 'rxjs/operators';

export function initIfNeeded(that: object, eventToken: symbol, destroyToken?: symbol) {
  if (!that[eventToken]) {
    that[destroyToken] = new Subject();
    let event$ = new Subject();

    that[eventToken] = event$.pipe(
      finalize(() => {
        event$.complete();
        event$ = null;

        that[destroyToken].next();
        that[destroyToken].complete();
        that[destroyToken] = null;
      }),
      publish(),
      refCount()
    );
  }
}
