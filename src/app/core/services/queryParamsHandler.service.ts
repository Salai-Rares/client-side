import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class QueryParamsService {


    createParams(params : {[key:string]:string | string[] }):HttpParams{
        let queryParams = new HttpParams();
        for(const key in params){
            const value = params[key];
            if(Array.isArray(value)){
                value.forEach((val:string)=>{
                    queryParams = queryParams.append(key,val);
                });
            } else {
                queryParams = queryParams.append(key,value);
            }
        }
        return queryParams;
    }
}