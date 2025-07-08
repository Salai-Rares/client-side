import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Filter } from '../models/filter';
import { map } from 'rxjs/operators';

import { QueryParamsService } from 'src/app/core/services/queryParamsHandler.service';
@Injectable()
export class FilterService {
  constructor(private http: HttpClient , private queryParamsService : QueryParamsService) {}

  getFilters(): Observable<Filter> {
    return this.http
      .get<{
        message: string;
        attributes: { count: number; key: string; value: string }[];
        priceRange: { minPrice: number; maxPrice: number };
      }>('http://localhost:3000/api/v1/products/queryies')
      .pipe(
        map((response) => {
          const { message: _, ...newResponse } = response;
          return newResponse;
        }),
        map((data) => {
          const newArrayCheckBoxes: any = [];
          const newCheckbox: any = {};
          data.attributes.map((checkbox) => {
            if (newCheckbox.hasOwnProperty(checkbox.key)) {
              //push in the array {value,count}
              newCheckbox[checkbox.key].push({
                value: checkbox.value,
                count: checkbox.count,
                checked: false
              });
            } else {
              newCheckbox[checkbox.key] = [
                { value: checkbox.value, count: checkbox.count,checked:false },
              ];
            }
          });
          for (const [key, value] of Object.entries(newCheckbox)) {
            newArrayCheckBoxes.push({ key:key,checkboxes:value });
          }
          data.attributes = newArrayCheckBoxes;
          return data;
        })
      );
  }
  /*  this.http.get<any>('your-api-endpoint', { params: queryParams }).subscribe((data) => {
      console.log(data);
    });*/

    getFiltersWithQuery(params : {[key:string] : string | string[]}) : Observable<Filter>
    {
       const httpParams : HttpParams = this.queryParamsService.createParams(params);
       return this.http
       .get<{
         message: string;
         attributes: { count: number; key: string; value: string }[];
         priceRange: { minPrice: number; maxPrice: number };
       }>('http://localhost:3000/api/v1/products/queryies', {params:httpParams})
       .pipe(
         map((response) => {
           const { message: _, ...newResponse } = response;
           return newResponse;
         }),
         map((data) => {
           const newArrayCheckBoxes: any = [];
           const newCheckbox: any = {};
           data.attributes.map((checkbox) => {
             if (newCheckbox.hasOwnProperty(checkbox.key)) {
               //push in the array {value,count}
               newCheckbox[checkbox.key].push({
                 value: checkbox.value,
                 count: checkbox.count,
                 checked: false
               });
             } else {
               newCheckbox[checkbox.key] = [
                 { value: checkbox.value, count: checkbox.count,checked:false },
               ];
             }
           });
           for (const [key, value] of Object.entries(newCheckbox)) {
             newArrayCheckBoxes.push({ key:key,checkboxes:value });
           }
           data.attributes = newArrayCheckBoxes;
           return data;
         })
       );
    }
}
