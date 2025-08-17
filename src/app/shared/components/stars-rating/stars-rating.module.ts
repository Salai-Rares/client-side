import { NgModule } from '@angular/core';


import { SharedModule } from 'src/app/shared/shared.module';

import { StarsRatingComponent } from './stars-rating.component';
// import { NgxStarRatingModule } from 'ngx-star-rating';

@NgModule({
  declarations: [StarsRatingComponent],
  imports: [SharedModule],
  exports : [StarsRatingComponent]
})
export class StarsRatingModule {}
