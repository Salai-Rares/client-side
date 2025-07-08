export interface Filter{
    attributes:{count:number,key:string,value:string}[],
    priceRange:{minPrice:number,maxPrice:number}
}