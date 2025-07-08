import { NgModule } from '@angular/core';
import { HeaderComponent } from './/header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared.module';
@NgModule({
  declarations: [HeaderComponent],
  imports: [FontAwesomeModule, SharedModule],
  exports: [HeaderComponent],
})
export class HeaderModule {}
