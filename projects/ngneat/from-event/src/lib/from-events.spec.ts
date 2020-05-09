import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChildren } from '@angular/core';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator';
import { Observable, Subject } from 'rxjs';
import { FromEvents } from '@ngneat/from-event';
import { takeUntil } from 'rxjs/operators';

let clicked = [];
let clickedFromConstructorSubscription = [];

@Component({
  selector: 'my-btn',
  template: `
    <button #button>
      <ng-content></ng-content>
    </button>
  `,
})
class ButtonComponent {}

@Component({
  template: `
    <my-btn id="1">Click One</my-btn>
    <my-btn id="2">Click Two</my-btn>
    <my-btn id="3">Click Three</my-btn>
  `,
})
class HostComponent implements AfterViewInit, OnDestroy {
  subject = new Subject();

  @FromEvents('click')
  @ViewChildren(ButtonComponent, { read: ElementRef })
  clicks$: Observable<MouseEvent>;

  constructor() {
    this.clicks$.pipe(takeUntil(this.subject)).subscribe((event) => {
      const id = (event.target as HTMLButtonElement).parentElement.getAttribute('id');
      clickedFromConstructorSubscription.push(id);
    });
  }

  ngAfterViewInit() {
    this.clicks$.pipe(takeUntil(this.subject)).subscribe((event) => {
      const id = (event.target as HTMLButtonElement).parentElement.getAttribute('id');
      clicked.push(id);
    });
  }

  ngOnDestroy() {
    this.subject.next();
  }
}

describe('FromEvents', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory({
    component: HostComponent,
    declarations: [ButtonComponent],
  });

  beforeEach(() => (spectator = createComponent()));

  it('should work with multiple events', () => {
    ['Click One', 'Click Two', 'Click Three'].forEach((txt) => {
      spectator.query<HTMLButtonElement>(byText(txt)).click();
    });

    expect(clicked).toEqual(['1', '2', '3']);
    expect(clickedFromConstructorSubscription).toEqual(['1', '2', '3']);
  });
});
