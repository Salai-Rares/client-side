import { ProductDatabaseModel } from "./productDatabase.model";

export interface ProductResponseModel {
    message:string;
    products:ProductDatabaseModel[];
    
}