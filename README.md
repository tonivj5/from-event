<p align="center">
 <img width="20%" height="20%" src="./logo.svg">
</p>

<br />

[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
[![ngneat](https://img.shields.io/badge/@-ngneat-383636?style=flat-square&labelColor=8f68d4)](https://github.com/ngneat/)

Only for Ivy

> The Library Slogan

## Installation

### NPM

`npm install @ngneat/from-event`

## Usage

```ts
import { FromEvent } from '@ngneat/from-event';

@Component({
  selector: 'my-btn',
  template: `
    <button #button>
      <ng-content></ng-content>
    </button>
  `
})
class ButtonComponent implements AfterViewInit, OnDestroy {
  @FromEvent('click')
  @ViewChild('button') click$: Observable<MouseEvent>;

  ngAfterViewInit() {
    this.click$.subscribe(console.log);
  }
}
```


```ts
import { FromEvents } from '@ngneat/from-event';

@Component({
  template: `
    <my-btn id="1">Click One</my-btn>
    <my-btn id="2">Click Two</my-btn>
    <my-btn id="3">Click Three</my-btn>
  `
})
class HostComponent implements AfterViewInit, OnDestroy {
  @FromEvents('click')
  @ViewChildren(ButtonComponent, { read: ElementRef }) clicks$: Observable<MouseEvent>;

  ngAfterViewInit() {
    this.clicks$.subscribe(console.log);
  }
}
```

Don't forget to unsubscribe.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
