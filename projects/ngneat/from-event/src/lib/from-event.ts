import { ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';

export function FromEvent<K extends keyof DocumentEventMap>(event: K, eventOptions?: AddEventListenerOptions) {
  return function (target: any, propertyKey: string) {
    const event$ = Symbol();

    Object.defineProperty(target, propertyKey, {
      set(elementRef: ElementRef) {
        this[event$] = fromEvent(elementRef.nativeElement, event, eventOptions);
      },
      get() {
        return this[event$];
      },
    });
  };
}
