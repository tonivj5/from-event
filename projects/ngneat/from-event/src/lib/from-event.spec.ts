import { AfterViewInit, Component, Input, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { FromEvent } from '@ngneat/from-event';
import { takeUntil, take, skip, switchMap } from 'rxjs/operators';

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
    this.clickFromConstructor$.pipe(takeUntil(this.subject)).subscribe((e) => {
      this.clickedOnConstrucor = true;
    });

    this.clickFromConstructor$.pipe(take(2), takeUntil(this.subject)).subscribe({
      complete: () => (this.oneConstructorStreamIsCompleted = true),
    });

    this.clickFromConstructor$.pipe(skip(4), takeUntil(this.subject)).subscribe((e) => {
      this.constructorIsClickedFiveTimes = true;
    });

    this.clickFromConstructorResubscribed$.subscribe((e) => {
      this.clickedOnResuscribedConstructor = true;
    });

    this.clickFromOnInit$.pipe(takeUntil(this.subject)).subscribe((e) => {
      this.clickedOnInit = true;
    });
  }

  ngOnInit() {
    this.clickFromOnInitStatic$.pipe(takeUntil(this.subject)).subscribe((e) => {
      this.clickedOnInitStatic = true;
    });
  }

  ngAfterViewInit() {
    this.resubscribe.next();

    this.click$.pipe(takeUntil(this.subject)).subscribe((e) => {
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
  `,
})
class HostComponent {
  show = false;

  toggle() {
    this.show = !this.show;
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
});
