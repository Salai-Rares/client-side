import { NgModule } from "@angular/core";
import { TestFormComponent } from "./test-form.component";
import { SharedModule } from "src/app/shared/shared.module";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImageSelectorComponent } from "src/app/shared/components/image-selector/image-selector.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RangeDatePickerComponent } from "src/app/shared/components/range-date-picker/range-date-picker.component";
@NgModule({
    declarations:[TestFormComponent],
    imports: [SharedModule, DragDropModule, NgSelectModule, ImageSelectorComponent,NgbModule,RangeDatePickerComponent]
})
export class TestFormModule{

}