import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Product } from './product.model';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  map,
  publishLast,
  refCount,
  shareReplay,
  tap,
} from 'rxjs/operators';
import { ProductMapperService } from './products-mapper.service';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private products: Product[] = [];

  private products$ = new BehaviorSubject<Product[]>([]);

  private productAdded$ = new Observable();

  constructor(
    private http: HttpClient,
    private productMapperService: ProductMapperService
  ) {}

  getProducts() {
    this.http
      .get<{ message: string; products: any }>(
        'http://localhost:3000/api/v1/products'
      )
      .pipe(
        map((productData: any) => {
          return this.productMapperService.mapToProductModel(productData);
        })
      )
      .subscribe((productsa) => {
        this.products = productsa;
        this.products$.next([...this.products]);
      });
  }

  getProductsAsObservable() {
    return this.products$.asObservable();
  }

  addProduct(title: string, content: string, image: File) {
    const productData = new FormData();
    productData.append('title', title);
    productData.append('description', content);
    productData.append('image', image, title);
    this.productAdded$ = this.http
      .post<{ message: string; product: any }>(
        'http://localhost:3000/api/v1/products',
        productData
      )
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.productAdded$.subscribe((product: any) => {
      const productToBePushed: Product = {
        idProduct: product.product._id,
        title: title,
        description: content,
        imagePath: product.product.imagePath,
        rating: product.product.rating,
      };
      this.products.push(productToBePushed);
      this.products$.next([...this.products]);
    });
  }
  getProductAddedObservable() {
    return this.productAdded$;
  }
}
