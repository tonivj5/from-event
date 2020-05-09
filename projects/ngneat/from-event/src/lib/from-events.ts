import { ElementRef, QueryList } from '@angular/core';
import { fromEvent, merge, defer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { initIfNeeded } from './init-if-needed';

export function FromEvents<K extends keyof DocumentEventMap>(event: K, eventOptions?: AddEventListenerOptions) {
  return function (target: any, propertyKey: string) {
    const eventToken = Symbol(propertyKey);

    Object.defineProperty(target, propertyKey, {
      set(list: QueryList<ElementRef>) {
        const events$ = list.changes.pipe(
          startWith(list.toArray()),
          switchMap((elements: Array<ElementRef>) => {
            const elements$ = elements.map(({ nativeElement }) => {
              return fromEvent(nativeElement, event, eventOptions);
            });

            return merge(...elements$);
          })
        );

        if (this[eventToken]) {
          events$.subscribe(this[eventToken]);
        }

        this[eventToken] = events$;
      },
      get() {
        initIfNeeded(this, eventToken);

        return defer(() => this[eventToken]);
      },
    });
  };
}
