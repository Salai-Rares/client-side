import { NgModule } from '@angular/core';
import { ProductsGridComponent } from './products-grid/products-grid.component';
import { ProductItemGridComponent } from './products-grid/product-item-grid/product-item-grid.component';
import { SharedModule } from 'src/app/shared/shared.module';

import { StarsRatingModule } from 'src/app/shared/components/stars-rating/stars-rating.module';


@NgModule({
  declarations: [
    ProductsGridComponent,
    ProductItemGridComponent
  ],
  imports: [
    SharedModule,StarsRatingModule
  ],
  exports: [],
  providers: []
})
export class ProductsModule { }
