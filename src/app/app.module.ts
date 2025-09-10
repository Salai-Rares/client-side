import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { SwiperModule } from 'swiper/angular';

import { SliderItemComponent } from './client/components/slider-item/slider-item.component';


import { HomepageComponent } from './client/components/homepage/homepage.component';
import { SliderBannerItemComponent } from './client/components/slider-banner-item/slider-banner-item.component';
import { ProductCreateComponent } from './admin/components/product-create/product-create.component';

import { AppRoutingModule } from './app-routing.module';

import { FormControlPipe } from './shared/pipes/formcontrolpipe';
import { CoreModule } from './core/core.module';
import { HeaderModule } from './shared/components/header/header.module';
import { ProductsModule } from './client/components/products/products.module';
import { SharedModule } from './shared/shared.module';
// import { StarsRatingModule } from './shared/components/stars-rating/stars-rating.module';
import { TestFormComponent } from './client/components/test-form/test-form.component';
import { TestFormModule } from './client/components/test-form/test-form.module';
import { ImageUploadComponent } from './client/components/image-upload/image-upload.component';
import { register } from 'swiper/element/bundle';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
register(); 
@NgModule({
  declarations: [
    AppComponent,
    ProductCreateComponent,
    SliderItemComponent,
    HomepageComponent,
    SliderBannerItemComponent,
    FormControlPipe,
    ImageUploadComponent,
    
    
  ],
  imports: [
    BrowserModule,
    CoreModule,
    ProductsModule,

    HeaderModule,
    SharedModule,
    BrowserAnimationsModule,
   
    // StarsRatingModule,
    TestFormModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
