import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { CONTROL_ERROR_MESSAGES, GLOBAL_ERROR_MESSAGES } from "./error-messages.types";

@Injectable({ providedIn: 'root' })
export class FormErrorService {
 

  getMessages(control: AbstractControl | null, controlName: string): string[] {
    if (!control || !control.errors || !(control.touched || control.dirty)) return [];
    return Object.keys(control.errors).map(err =>
      CONTROL_ERROR_MESSAGES[controlName]?.[err] ??
      GLOBAL_ERROR_MESSAGES[err] ??
      `Unknown error: ${err}`
    );
  }
}
