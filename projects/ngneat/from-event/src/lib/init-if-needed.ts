import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function initIfNeeded(that: object, eventToken: symbol, destroyToken: symbol) {
  if (!that[eventToken]) {
    that[destroyToken] = new Subject();
    let event$ = new Subject();

    that[eventToken] = event$.pipe(
      finalize(() => {
        that[destroyToken].next();
        that[destroyToken].complete();
        that[destroyToken] = null;

        event$.complete();
        event$ = null;
      })
    );
  }
}
