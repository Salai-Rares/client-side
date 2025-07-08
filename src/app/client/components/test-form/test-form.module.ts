import { NgModule } from "@angular/core";
import { TestFormComponent } from "./test-form.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
    declarations:[TestFormComponent],
    imports:[SharedModule]
})
export class TestFormModule{

}