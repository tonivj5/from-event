import { ElementRef } from '@angular/core';
import { fromEvent, defer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { initIfNeeded } from './init-if-needed';

export function FromEvent<K extends keyof DocumentEventMap>(event: K, eventOptions?: AddEventListenerOptions) {
  return function (target: any, propertyKey: string) {
    const eventToken = Symbol(propertyKey);
    const destroyToken = Symbol(propertyKey);

    Object.defineProperty(target, propertyKey, {
      set(elementRef: ElementRef) {
        const event$ = fromEvent(elementRef.nativeElement, event, eventOptions);

        if (this[eventToken]) {
          event$.pipe(takeUntil(this[destroyToken])).subscribe(this[eventToken]);
        }

        this[eventToken] = event$;
      },
      get() {
        initIfNeeded(this, eventToken, destroyToken);

        return defer(() => this[eventToken]);
      },
    });
  };
}
