import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { QueryParamsService } from './services/queryParamsHandler.service';


@NgModule({ imports: [], providers: [QueryParamsService, provideHttpClient()] })
export class CoreModule { }
