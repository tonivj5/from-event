import { AfterViewInit, Component, ViewChildren } from '@angular/core';
import { observer } from '../observer';
import { FromEvents } from '@ngneat/from-event';
import { Observable } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-view-children',
  template: `
    <button #button>Multi</button>
    <button #button>Multi</button>
    <button #button>Multi</button>
  `,
})
export class ViewChildrenComponent implements AfterViewInit {
  @FromEvents('click')
  @ViewChildren('button')
  clicks$: Observable<MouseEvent>;

  ngAfterViewInit() {
    this.clicks$.pipe(untilDestroyed(this)).subscribe(observer('ViewChildrenComponent: clicks$'));
  }
}
