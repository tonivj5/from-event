import { Observable, Subject, Subscription } from 'rxjs';

import type { createTokens } from './helpers';

export type Tokens = ReturnType<typeof createTokens>;

declare var tokens: Tokens;

export interface That {
  [tokens.event]: Observable<Event>;
  [tokens.subject]: Subject<Event>;
  [tokens.subscription]: Subscription;
}
