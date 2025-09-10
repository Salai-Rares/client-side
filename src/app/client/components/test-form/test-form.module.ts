import { NgModule } from "@angular/core";
import { TestFormComponent } from "./test-form.component";
import { SharedModule } from "src/app/shared/shared.module";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImageSelectorComponent } from "src/app/shared/components/image-selector/image-selector.component";
@NgModule({
    declarations:[TestFormComponent],
    imports: [SharedModule, DragDropModule, NgSelectModule, ImageSelectorComponent]
})
export class TestFormModule{

}