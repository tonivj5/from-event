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

    <button #resubscribe>Resubscribe</button>

    <button (click)="state = (state + 1) % 3">Toggle State</button>

    <button *ngIf="isOrig" #destroyable>Original</button>
    <button *ngIf="isAlt" #destroyable>Alternative</button>
  `,
})
class HostComponent implements AfterViewInit, OnDestroy {
  subject = new Subject();

  @FromEvents('click')
  @ViewChildren(ButtonComponent, { read: ElementRef })
  clicks$: Observable<MouseEvent>;

  @FromEvents('click')
  @ViewChildren('resubscribe')
  resubscribe$: Observable<MouseEvent>;

  resubscribeSubscription = this.resubscribe$.subscribe(() => {
    this.timesClicked++;
  });

  @FromEvents('click')
  @ViewChildren('destroyable')
  destroyable$: Observable<MouseEvent>;

  timesClicked = 0;

  private states = ['orig', 'alt', 'none'];

  state = 0;

  get isOrig() {
    return this.states[this.state] === 'orig';
  }

  get isAlt() {
    return this.states[this.state] === 'alt';
  }

  constructor() {
    this.clicks$.pipe(takeUntil(this.subject)).subscribe((event) => {
      const id = (event.target as HTMLButtonElement).parentElement.getAttribute('id');
      clickedFromConstructorSubscription.push(id);
    });

    this.destroyable$.subscribe(() => {
      this.timesClicked++;
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

  it('should work with dynamic views', () => {
    const toggle = spectator.query<HTMLButtonElement>(byText('Toggle State'));

    expect(spectator.component.timesClicked).toBe(0);

    spectator.query<HTMLButtonElement>(byText('Original')).click();
    toggle.click();
    spectator.detectChanges();

    spectator.query<HTMLButtonElement>(byText('Alternative')).click();
    toggle.click();
    spectator.detectChanges();
    expect(spectator.query<HTMLButtonElement>(byText('Original'))).toBeNull();
    expect(spectator.query<HTMLButtonElement>(byText('Alternative'))).toBeNull();

    toggle.click();
    spectator.detectChanges();
    spectator.query<HTMLButtonElement>(byText('Original')).click();

    expect(spectator.component.timesClicked).toBe(3);
  });

  it('should work on re-subscription', () => {
    expect(spectator.component.timesClicked).toBe(0);

    spectator.query<HTMLButtonElement>(byText('Resubscribe')).click();

    expect(spectator.component.timesClicked).toBe(1);

    spectator.component.resubscribeSubscription.unsubscribe();

    spectator.component.resubscribe$.subscribe(() => {
      spectator.component.timesClicked++;
    });

    spectator.query<HTMLButtonElement>(byText('Resubscribe')).click();

    expect(spectator.component.timesClicked).toBe(2);
  });
});
