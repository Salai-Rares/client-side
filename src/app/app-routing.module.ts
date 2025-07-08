import { NgModule } from "@angular/core";
import {  RouterModule, Routes } from "@angular/router";
import { HomepageComponent } from "./client/components/homepage/homepage.component";
import { ProductsGridComponent } from "./client/components/products/products-grid/products-grid.component";
import { TestFormComponent } from "./client/components/test-form/test-form.component";
const routes: Routes = [
    {path:'',component:HomepageComponent},
    {path:'produse', component:ProductsGridComponent},
    {path:'create',component:TestFormComponent}
]

@NgModule({
    imports:[RouterModule.forRoot(routes)],
    exports:[RouterModule]
})
export class AppRoutingModule{

}