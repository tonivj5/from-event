import { Observable, Subject, Subscription } from 'rxjs';

import { createTokens } from './helpers';

export type Tokens = ReturnType<typeof createTokens>;

declare var tokens: Tokens;

export interface That {
  [tokens.event]: Observable<Event>;
  [tokens.subject]: Subject<Event>;
  [tokens.destroy]: Subject<void>;
  [tokens.subscription]: Subscription;
}
