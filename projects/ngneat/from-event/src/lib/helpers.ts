import { Subject } from 'rxjs';
import { finalize, share, takeUntil } from 'rxjs/operators';

import { That, Tokens } from './types';

export function createTokens(propertyKey: string) {
  const event = Symbol(`event ${propertyKey}`);
  const subject = Symbol(`subject ${propertyKey}`);
  const destroy = Symbol(`destroy ${propertyKey}`);
  const subscription = Symbol(`subscription ${propertyKey}`);

  return {
    event,
    subject,
    destroy,
    subscription,
  } as const;
}

export function initIfNeeded(that: That, tokens: Tokens) {
  if (that[tokens.subject]) {
    return;
  }

  that[tokens.destroy] = new Subject<void>();
  let event$ = new Subject<Event>();

  that[tokens.subject] = event$.pipe(
    finalize(() => {
      if (that[tokens.subscription]) {
        that[tokens.subscription].unsubscribe();
        that[tokens.subscription] = null;
      }

      event$.complete();
      event$ = null;
      that[tokens.subject] = null;

      that[tokens.destroy].next();
      that[tokens.destroy].complete();
      that[tokens.destroy] = null;
    }),
    share()
  ) as typeof event$;
}

export function subscribeToEventIfPossible(that: That, tokens: Tokens) {
  if (that[tokens.subscription] || !that[tokens.event]) {
    return;
  }

  that[tokens.subscription] = that[tokens.event].pipe(takeUntil(that[tokens.destroy])).subscribe(that[tokens.subject]);
}
