import {Pipe, PipeTransform } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { UntypedFormControl } from "@angular/forms";
@Pipe({
    name:'formControlPipe'
})
export class FormControlPipe implements PipeTransform{
    transform(value: AbstractControl) :UntypedFormControl {
        return value as UntypedFormControl;
    }
}