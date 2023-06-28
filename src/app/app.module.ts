import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from './components/header/header.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { SwiperModule } from 'swiper/angular';

import { SliderItemComponent } from './components/slider-item/slider-item.component';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StarsRatingComponent } from './components/stars-rating/stars-rating.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SliderBannerItemComponent } from './components/slider-banner-item/slider-banner-item.component';
import { ProductCreateComponent } from './components/products/product-create/product-create.component'
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';
import { ProductsGridComponent } from './components/products-grid/products-grid.component';
import { ProductItemGridComponent } from './components/products-grid/product-item-grid/product-item-grid.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,

    SliderItemComponent,
    StarsRatingComponent,
    HomepageComponent,
    SliderBannerItemComponent,
    ProductCreateComponent,
    ProductsGridComponent,
    ProductItemGridComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    SwiperModule,
    NgxStarRatingModule,
    FormsModule, 
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
