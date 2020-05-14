import { AfterViewInit, Component, Input, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { FromEvent } from '@ngneat/from-event';
import { takeUntil, take, skip, switchMap, mapTo } from 'rxjs/operators';

let destroyed = [];

@Component({
  selector: 'my-btn',
  template: `
    <button #button>
      <ng-content></ng-content>
    </button>

    <button #buttonConstructor>Constructor {{ id }}</button>

    <button #buttonOnInit>OnInit {{ id }}</button>
  `,
})
class ButtonComponent implements OnInit, AfterViewInit, OnDestroy {
  private subject = new Subject();
  private resubscribe = new BehaviorSubject<void>(null);
  @Input() id;

  clicked = false;
  clickedOnConstrucor = false;
  clickedOnInit = false;
  clickedOnInitStatic = false;
  clickedOnResuscribedConstructor = false;

  constructorIsClickedFiveTimes = false;
  oneConstructorStreamIsCompleted = false;

  @FromEvent('click')
  @ViewChild('button')
  click$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('buttonConstructor')
  clickFromConstructor$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('buttonOnInit', { static: true })
  clickFromOnInit$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('buttonOnInit', { static: true })
  clickFromOnInitStatic$: Observable<MouseEvent>;

  clickFromConstructorResubscribed$ = this.resubscribe.pipe(switchMap(() => this.clickFromConstructor$));

  constructor() {
    this.clickFromConstructor$.pipe(takeUntil(this.subject)).subscribe(() => {
      this.clickedOnConstrucor = true;
    });

    this.clickFromConstructor$.pipe(take(2), takeUntil(this.subject)).subscribe({
      complete: () => (this.oneConstructorStreamIsCompleted = true),
    });

    this.clickFromConstructor$.pipe(skip(4), takeUntil(this.subject)).subscribe(() => {
      this.constructorIsClickedFiveTimes = true;
    });

    this.clickFromConstructorResubscribed$.subscribe(() => {
      this.clickedOnResuscribedConstructor = true;
    });

    this.clickFromOnInit$.pipe(takeUntil(this.subject)).subscribe(() => {
      this.clickedOnInit = true;
    });
  }

  ngOnInit() {
    this.clickFromOnInitStatic$.pipe(takeUntil(this.subject)).subscribe(() => {
      this.clickedOnInitStatic = true;
    });
  }

  ngAfterViewInit() {
    this.resubscribe.next();

    this.click$.pipe(takeUntil(this.subject)).subscribe(() => {
      this.clicked = true;
    });
  }

  ngOnDestroy() {
    destroyed.push(this.id);
    this.subject.next();
  }
}

@Component({
  template: `
    <button (click)="toggle()" class="toggle">Toggle</button>
    <section *ngIf="show">
      <my-btn [id]="1">Click One</my-btn>
      <my-btn [id]="2">Click Two</my-btn>
    </section>

    <button (click)="state = (state + 1) % 3">Toggle State</button>

    <button *ngIf="isOrig" #destroyable>Original</button>
    <button *ngIf="isAlt" #destroyable>Alternative</button>

    <button #resubscribe>Resubscribe</button>

    <button #plus>+1</button>
  `,
})
class HostComponent {
  show = false;

  toggle() {
    this.show = !this.show;
  }

  @FromEvent('click')
  @ViewChild('resubscribe')
  resubscribe$: Observable<MouseEvent>;

  @FromEvent('click')
  @ViewChild('plus')
  plus$: Observable<MouseEvent>;

  resubscribeSubscription = this.resubscribe$.subscribe(() => {
    this.timesClicked++;
  });

  @FromEvent('click')
  @ViewChild('destroyable')
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
    this.destroyable$.subscribe(() => {
      this.timesClicked++;
    });
  }
}

describe('FromEvent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory({
    component: HostComponent,
    declarations: [ButtonComponent],
  });

  beforeEach(() => (spectator = createComponent()));

  it('should turn the property into observable', () => {
    spectator.click('.toggle');
    const buttons = spectator.queryAll(ButtonComponent);
    buttons.forEach((button) => {
      expect(button.click$).toBeInstanceOf(Observable);
    });
  });

  it('should register the event', function () {
    spectator.click('.toggle');
    ['Click One', 'Click Two'].forEach((txt) => {
      spectator.query<HTMLButtonElement>(byText(txt)).click();
    });

    const buttons = spectator.queryAll(ButtonComponent);
    buttons.forEach((btn) => expect(btn.clicked).toBeTrue());
  });

  it('should unsubscribe on destroy', () => {
    destroyed = [];
    spectator.click('.toggle');
    expect(spectator.queryAll(ButtonComponent).length).toBe(2);
    spectator.click('.toggle');
    expect(spectator.queryAll(ButtonComponent).length).toBe(0);
    expect(destroyed).toEqual([1, 2]);
  });

  it('should subscribe to observable on constructor', () => {
    spectator.click('.toggle');

    [1, 2].forEach((id) => {
      spectator.query<HTMLButtonElement>(byText(`Constructor ${id}`)).click();
    });

    const buttons = spectator.queryAll(ButtonComponent);
    buttons.forEach((btn) => {
      expect(btn.clicked).toBeFalse();
      expect(btn.clickedOnInitStatic).toBeFalse();
      expect(btn.clickedOnInit).toBeFalse();

      expect(btn.clickedOnConstrucor).toBeTrue();
    });
  });

  it('should subscribe to observable on ngOnInit', () => {
    spectator.click('.toggle');

    [1, 2].forEach((id) => {
      spectator.query<HTMLButtonElement>(byText(`OnInit ${id}`)).click();
    });

    const buttons = spectator.queryAll(ButtonComponent);
    buttons.forEach((btn) => {
      expect(btn.clicked).toBeFalse();
      expect(btn.clickedOnConstrucor).toBeFalse();

      expect(btn.clickedOnInit).toBeTrue();
      expect(btn.clickedOnInitStatic).toBeTrue();
    });
  });

  it('should allow re-subscription of an observable setted before ngAfterViewInit', () => {
    spectator.click('.toggle');

    [1, 2].forEach((id) => {
      spectator.query<HTMLButtonElement>(byText(`Constructor ${id}`)).click();
    });

    const buttons = spectator.queryAll(ButtonComponent);
    buttons.forEach((btn) => {
      expect(btn.clicked).toBeFalse();

      expect(btn.clickedOnResuscribedConstructor).toBeTrue();
    });
  });

  it('should subscribe multiple times being independent streams', () => {
    spectator.click('.toggle');

    const [buttonOne] = spectator.queryAll(ButtonComponent);

    expect(buttonOne.oneConstructorStreamIsCompleted).toBeFalse();
    expect(buttonOne.constructorIsClickedFiveTimes).toBeFalse();

    for (let i = 0; i < 2; i++) {
      spectator.query<HTMLButtonElement>(byText(`Constructor 1`)).click();
    }

    expect(buttonOne.oneConstructorStreamIsCompleted).toBeTrue();
    expect(buttonOne.constructorIsClickedFiveTimes).toBeFalse();

    for (let i = 0; i < 3; i++) {
      spectator.query<HTMLButtonElement>(byText(`Constructor 1`)).click();
    }

    expect(buttonOne.constructorIsClickedFiveTimes).toBeTrue();
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

  it('should work defering the initialization', () => {
    let count = 0;

    // Doing this, we don't call the getter.
    const plusOne$ = spectator.component.plus$.pipe(mapTo(1));

    const subs = spectator.component.resubscribe$.pipe(switchMap(() => plusOne$)).subscribe(() => count++);

    // Call finalize
    spectator.query<HTMLButtonElement>(byText('Resubscribe')).click();
    // Recall finalize, but how the getter hasn't been called the subject, destroy, etc.
    // aren't initialized and it throws an error.
    spectator.query<HTMLButtonElement>(byText('Resubscribe')).click();

    spectator.query<HTMLButtonElement>(byText('+1')).click();

    expect(count).toBe(1);

    subs.unsubscribe();
  });
});
