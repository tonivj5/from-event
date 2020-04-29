import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-button',
  template: ` <button><ng-content></ng-content></button> `,
})
export class ButtonComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
