import {Pipe, PipeTransform } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { FormControl } from "@angular/forms";
@Pipe({
    name:'formControlPipe'
})
export class FormControlPipe implements PipeTransform{
    transform(value: AbstractControl) :FormControl {
        return value as FormControl;
    }
}