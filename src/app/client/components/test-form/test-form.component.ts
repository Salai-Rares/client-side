import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  FormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss'],
})
export class TestFormComponent {
  form: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      settings: this.fb.group({
        threshold: [5, [Validators.required, Validators.min(0)]],
        tags: this.fb.array(
          [this.fb.control('default')],
          this.validateTagsArray
        ),
      }),
      variants: this.fb.array([this.createVariantGroup()]),
    });
  }

  // getter for easy access to FormArray
  get tags(): UntypedFormArray {
    return this.form.get('settings.tags') as UntypedFormArray;
  }

  addTag() {
    this.tags.push(this.fb.control(''));
  }

  removeTag(index: number) {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

  onSubmit() {
    console.log(this.form.value);
  }

  validateTagsArray(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof UntypedFormArray)) return null;

    const tags = control.controls.map((ctrl) => ctrl.value?.trim());
    const hasEmpty = tags.some((tag) => !tag);
    const duplicates = new Set(tags).size !== tags.length;

    const errors: ValidationErrors = {};
    if (hasEmpty) errors['emptyTag'] = true;
    if (duplicates) errors['duplicateTag'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  get variants(): UntypedFormArray {
    return this.form.get('variants') as UntypedFormArray;
  }
  createVariantGroup(): UntypedFormGroup {
    return this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      productOptions: this.fb.array([this.createProductOptionGroup()]),
      images: this.fb.array([this.createImageGroup()]),
    });
  }
  createProductOptionGroup(): UntypedFormGroup {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });
  }
  createImageGroup(): UntypedFormGroup {
    return this.fb.group({
      file: [null, Validators.required],
      preview: [''],
    });
  }
  addVariant() {
    this.variants.push(this.createVariantGroup());
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  getProductOptions(variantIndex: number): UntypedFormArray {
    return this.variants.at(variantIndex).get('productOptions') as UntypedFormArray;
  }

  addProductOption(variantIndex: number) {
    this.getProductOptions(variantIndex).push(this.createProductOptionGroup());
  }

  removeProductOption(variantIndex: number, optionIndex: number) {
    this.getProductOptions(variantIndex).removeAt(optionIndex);
  }

  getVariantImages(variantIndex: number): UntypedFormArray {
    return this.variants.at(variantIndex).get('images') as UntypedFormArray;
  }

  addVariantImage(variantIndex: number) {
    this.getVariantImages(variantIndex).push(this.createImageGroup());
  }

  removeVariantImage(variantIndex: number, imageIndex: number) {
    this.getVariantImages(variantIndex).removeAt(imageIndex);
  }
  onDragOver(event: DragEvent) {
  event.preventDefault();
  (event.currentTarget as HTMLElement).classList.add('dragover');
}

onDragLeave(event: DragEvent) {
  (event.currentTarget as HTMLElement).classList.remove('dragover');
}

onDrop(event: DragEvent, variantIndex: number) {
  event.preventDefault();
  (event.currentTarget as HTMLElement).classList.remove('dragover');

  const files = event.dataTransfer?.files;
  if (files) {
    Array.from(files).forEach((file) => {
      this.readImageFile(file, variantIndex);
    });
  }
}

onImageSelected(event: Event, variantIndex: number) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files) {
    Array.from(files).forEach((file) => {
      this.readImageFile(file, variantIndex);
    });
  }
}

readImageFile(file: File, variantIndex: number) {
  const reader = new FileReader();
  reader.onload = () => {
    const images = this.getVariantImages(variantIndex);
    images.push(
      this.fb.group({
        file: [file],
        preview: [reader.result]
      })
    );
  };
  reader.readAsDataURL(file);
}

}
