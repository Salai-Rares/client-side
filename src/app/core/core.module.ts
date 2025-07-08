import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { QueryParamsService } from './services/queryParamsHandler.service';


@NgModule({
  
  imports : [HttpClientModule],
  exports : [HttpClientModule],
  providers: [QueryParamsService]
})
export class CoreModule { }
