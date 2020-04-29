import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { CheckDirective } from './check.directive';
import { ButtonComponent } from './button/button.component';
import { ViewChildrenComponent } from './view-children/view-children.component';

@NgModule({
  declarations: [AppComponent, TestComponent, CheckDirective, ButtonComponent, ViewChildrenComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
