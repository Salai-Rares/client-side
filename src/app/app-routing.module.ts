import { NgModule } from "@angular/core";
import {  RouterModule, Routes } from "@angular/router";
import { HomepageComponent } from "./components/homepage/homepage.component";
import { ProductsGridComponent } from "./components/products-grid/products-grid.component";
const routes: Routes = [
    {path:'',component:HomepageComponent},
    {path:'produse', component:ProductsGridComponent}
]

@NgModule({
    imports:[RouterModule.forRoot(routes)],
    exports:[RouterModule]
})
export class AppRoutingModule{

}