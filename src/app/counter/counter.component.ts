import { Component, ViewChild } from '@angular/core';
import { FromEvent } from '@ngneat/from-event';
import { Observable, merge } from 'rxjs';
import { logDestroy } from '../observer';
import { mapTo, scan, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  @FromEvent('click')
  @ViewChild('plus')
  plus$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('minus')
  minus$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('reset')
  reset$: Observable<MouseEvent>;

  count$ = merge(this.plus$.pipe(mapTo(1)), this.minus$.pipe(mapTo(-1))).pipe(
    startWith(0),
    scan((count, addition) => count + addition)
  );

  counter$ = this.reset$.pipe(
    startWith(null),
    switchMap(() => this.count$)
  );

  ngOnDestroy() {
    logDestroy('CounterComponent');
  }
}
