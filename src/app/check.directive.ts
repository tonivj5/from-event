import { AfterViewInit, ContentChild, Directive, ElementRef, OnDestroy } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { Observable } from 'rxjs';
import { FromEvent } from '@ngneat/from-event';
import { logDestroy, observer } from './observer';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Directive({ selector: '[appCheck]' })
export class CheckDirective implements AfterViewInit, OnDestroy {
  @FromEvent('click')
  @ContentChild(ButtonComponent, { read: ElementRef })
  click$: Observable<MouseEvent>;

  ngAfterViewInit() {
    this.click$.pipe(untilDestroyed(this)).subscribe(observer('CheckDirective: button$'));
  }

  ngOnDestroy() {
    logDestroy('CheckDirective');
  }
}
