import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FromEvent } from '@ngneat/from-event';
import { interval, Observable } from 'rxjs';
import { logDestroy, observer } from '../observer';
import { switchMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
})
export class TestComponent implements AfterViewInit, OnDestroy {
  @FromEvent('click')
  @ViewChild('button')
  click$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('button2')
  click2$: Observable<MouseEvent>;

  ngAfterViewInit() {
    this.click$
      .pipe(
        switchMap(() => interval(1000)),
        untilDestroyed(this)
      )
      .subscribe(observer('TestComponent: button$'));

    this.click2$.pipe(untilDestroyed(this)).subscribe(observer('TestComponent: button2$'));
  }

  ngOnDestroy() {
    logDestroy('TestComponent');
  }
}
