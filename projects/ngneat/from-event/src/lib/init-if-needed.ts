import { Subject } from 'rxjs';
import { finalize, refCount, publish } from 'rxjs/operators';

export function initIfNeeded(that: object, eventToken: symbol) {
  if (!that[eventToken]) {
    let event$ = new Subject();

    that[eventToken] = event$.pipe(
      finalize(() => {
        event$.complete();
        event$ = null;
      }),
      publish(),
      refCount()
    );
  }
}
