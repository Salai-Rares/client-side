import { Component, OnInit } from '@angular/core';
import { Subscription ,Observable} from 'rxjs';
import {ProductsService} from '../products/services/products.service'

import { Product } from '../products/models/product.model';


@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    standalone: false
})

export class HomepageComponent implements OnInit {



  products$!: Observable<Product[]>;
 

  //Breakpoints for swiper
  breakpoints = {
    0: { slidesPerView: 2, spaceBetween: 5 },
    768: { slidesPerView: 3, spaceBetween: 10 },
    1028:{ slidesPerView : 5, spaceBetween : 15},
    1400: { slidesPerView: 6, spaceBetween: 20 },
  };
  constructor(public productsService :ProductsService) { }
  ngOnInit(): void {
    this.productsService.getProducts();
    this.products$ = this.productsService.getProductsAsObservable();
    
  }

}
