import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator';
import { Observable, Subject } from 'rxjs';
import { FromEvent } from '@ngneat/from-event';
import { takeUntil } from 'rxjs/operators';

let destroyed = [];

@Component({
  selector: 'my-btn',
  template: `
    <button #button>
      <ng-content></ng-content>
    </button>
  `,
})
class ButtonComponent implements AfterViewInit, OnDestroy {
  private subject = new Subject();
  @Input() id;

  clicked = false;

  @FromEvent('click')
  @ViewChild('button')
  click$: Observable<MouseEvent>;

  ngAfterViewInit() {
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
});
