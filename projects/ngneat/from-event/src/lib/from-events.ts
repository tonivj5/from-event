import { ElementRef, QueryList } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

export function FromEvents<K extends keyof DocumentEventMap>(event: K, eventOptions?: AddEventListenerOptions) {
  return function (target: any, propertyKey: string) {
    const event$ = Symbol();

    Object.defineProperty(target, propertyKey, {
      set(list: QueryList<ElementRef>) {
        this[event$] = list.changes.pipe(
          startWith(list.toArray()),
          switchMap((elements: Array<ElementRef>) => {
            const elements$ = elements.map(({ nativeElement }) => {
              return fromEvent(nativeElement, event, eventOptions);
            });

            return merge(...elements$);
          })
        );
      },
      get() {
        return this[event$];
      },
    });
  };
}
