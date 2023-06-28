import {Product} from "./product.model"
import {  ProductResponseModel } from "./productResponse.model";
import { Injectable } from "@angular/core";
import { ProductDatabaseModel } from "./productDatabase.model";


@Injectable({providedIn:"root"})
export class ProductMapperService{
    mapToProductModel( productsArray:ProductResponseModel):Product[]{
       
        return productsArray.products.map((product:ProductDatabaseModel) => ({
            idProduct:product._id,
            title:product.title,
            description:product.description,
            imagePath:product.imagePath,
            rating:product.rating
        }));
    }
}