import {Product} from "../models/product.model"
import {  ProductResponseModel } from "../models/productResponse.model";
import { Injectable } from "@angular/core";
import { ProductDatabaseModel } from "../models/productDatabase.model";


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