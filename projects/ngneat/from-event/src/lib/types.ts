import { Observable, Subject, Subscription } from 'rxjs';

import { createTokens } from './create-tokens';

export type Tokens = ReturnType<typeof createTokens>;

declare var tokens: Tokens;

export interface This {
  [tokens.event]: Observable<Event>;
  [tokens.subject]: Subject<Event>;
  [tokens.subscription]: Subscription;
}
