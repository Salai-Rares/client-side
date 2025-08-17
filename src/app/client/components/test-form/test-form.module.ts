import { NgModule } from "@angular/core";
import { TestFormComponent } from "./test-form.component";
import { SharedModule } from "src/app/shared/shared.module";
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations:[TestFormComponent],
    imports:[SharedModule,DragDropModule]
})
export class TestFormModule{

}