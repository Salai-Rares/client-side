import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ImageValidationConfig, ImageProcessingService, ProcessedImage } from 'src/app/shared/services/image-processing.service';

@Component({
  selector: 'app-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss'],
})
export class TestFormComponent {
  form: FormGroup;
  isDragOver = false;
  selectedImage: string | null = null;
  processingImages: { [variantIndex: number]: boolean } = {};
  imageErrors: { [variantIndex: number]: string[] } = {};
  
  // Track if form submission has been attempted
  isFormSubmitAttempted = false;

  // Image validation configuration
  private readonly imageConfig: ImageValidationConfig = {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 2000,
    maxHeight: 2000,
    minWidth: 100,
    minHeight: 100
  };

  constructor(
    private fb: FormBuilder,
    private imageProcessingService: ImageProcessingService
  ) {
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

  trackByImageIndex(index: number, item: any): number {
    return index;
  }

  // Image Modal Functions
  openImageModal(imageSrc: string) {
    this.selectedImage = imageSrc;
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  // Tags methods
  get tags(): FormArray {
    return this.form.get('settings.tags') as FormArray;
  }

  addTag() {
    this.tags.push(this.fb.control(''));
  }

  removeTag(index: number) {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

  validateTagsArray(control: AbstractControl): ValidationErrors | null {
    if (!(control instanceof FormArray)) return null;

    const tags = control.controls.map((ctrl) => ctrl.value?.trim()).filter(tag => tag);
    const allValues = control.controls.map((ctrl) => ctrl.value?.trim());
    
    const hasEmpty = allValues.some((tag) => !tag);
    const duplicates = new Set(tags).size !== tags.length;

    const errors: ValidationErrors = {};
    if (hasEmpty) errors['emptyTag'] = true;
    if (duplicates) errors['duplicateTag'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  // Variants methods
  get variants(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  createVariantGroup(): FormGroup {
    return this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
      productOptions: this.fb.array([this.createProductOptionGroup()]),
      images: this.fb.array([]), // Start with empty array instead of one empty image
    });
  }

  createProductOptionGroup(): FormGroup {
    return this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });
  }

  createImageGroup(file: File, preview: string): FormGroup {
    return this.fb.group({
      file: [file, Validators.required],
      preview: [preview, Validators.required],
    });
  }

  addVariant() {
    this.variants.push(this.createVariantGroup());
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
    // Clean up error tracking
    delete this.processingImages[index];
    delete this.imageErrors[index];
  }

  // Product Options methods
  getProductOptions(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('productOptions') as FormArray;
  }

  addProductOption(variantIndex: number) {
    this.getProductOptions(variantIndex).push(this.createProductOptionGroup());
  }

  removeProductOption(variantIndex: number, optionIndex: number) {
    this.getProductOptions(variantIndex).removeAt(optionIndex);
  }

  // Image handling methods
  getVariantImages(variantIndex: number): FormArray {
    return this.variants.at(variantIndex).get('images') as FormArray;
  }

  removeVariantImage(variantIndex: number, imageIndex: number) {
    this.getVariantImages(variantIndex).removeAt(imageIndex);
  }

  // Drag and Drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent, variantIndex: number) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileInput(files, variantIndex);
    }
  }

  onImageSelected(event: Event, variantIndex: number) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      this.handleFileInput(files, variantIndex);
    }
    
    // Reset input value to allow same file selection again
    input.value = '';
  }

  // Unified file handling method
  private handleFileInput(files: FileList, variantIndex: number) {
    this.processingImages[variantIndex] = true;
    this.imageErrors[variantIndex] = [];

    this.imageProcessingService.processFiles(files, this.imageConfig)
      .subscribe({
        next: (processedImages: ProcessedImage[]) => {
          const validImages = processedImages.filter(img => img.isValid);
          const invalidImages = processedImages.filter(img => !img.isValid);

          // Add valid images to form
          const imagesArray = this.getVariantImages(variantIndex);
          validImages.forEach(processedImage => {
            const imageGroup = this.createImageGroup(processedImage.file, processedImage.preview);
            imagesArray.push(imageGroup);
          });

          // Track errors for invalid images
          if (invalidImages.length > 0) {
            this.imageErrors[variantIndex] = invalidImages.map(img => 
              `${img.file.name}: ${img.error}`
            );
          }

          this.processingImages[variantIndex] = false;
        },
        error: (error) => {
          console.error('Error processing images:', error);
          this.imageErrors[variantIndex] = ['Failed to process images. Please try again.'];
          this.processingImages[variantIndex] = false;
        }
      });
  }

  // Image reordering
  drop(event: CdkDragDrop<any[]>, variantIndex: number): void {
    const imagesArray = this.getVariantImages(variantIndex);
    const { previousIndex, currentIndex } = event;
    
    // Remove the control from its current position
    const movedControl = imagesArray.at(previousIndex);
    imagesArray.removeAt(previousIndex);
    
    // Insert it at the new position
    imagesArray.insert(currentIndex, movedControl);
  }

  // Utility methods
  isProcessingImages(variantIndex: number): boolean {
    return !!this.processingImages[variantIndex];
  }

  getImageErrors(variantIndex: number): string[] {
    return this.imageErrors[variantIndex] || [];
  }

  hasImageErrors(variantIndex: number): boolean {
    return this.getImageErrors(variantIndex).length > 0;
  }

  clearImageErrors(variantIndex: number) {
    delete this.imageErrors[variantIndex];
  }

  getReadableFileSize(bytes: number): string {
    return this.imageProcessingService.getReadableFileSize(bytes);
  }

  // Check if any variant is processing images
  hasAnyProcessing(): boolean {
    return Object.values(this.processingImages).some(processing => processing);
  }

  // Get total number of validation errors
  getErrorCount(): number {
    return this.getFormValidationErrors(this.form).length;
  }

  // Recursively count all validation errors in the form
  private getFormValidationErrors(form: FormGroup | FormArray): any[] {
    let formErrors: any[] = [];

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      const controlErrors: ValidationErrors | null = control?.errors ?? null;
      
      if (controlErrors && control?.touched) {
        formErrors.push({
          control: key,
          errors: controlErrors
        });
      }

      if (control instanceof FormGroup || control instanceof FormArray) {
        formErrors = formErrors.concat(this.getFormValidationErrors(control));
      }
    });

    return formErrors;
  }

  // Enhanced onSubmit with better validation handling
  onSubmit() {
    this.isFormSubmitAttempted = true;
    
    // Check if any images are still processing
    if (this.hasAnyProcessing()) {
      this.showValidationMessage('Please wait for image processing to complete before submitting.');
      return;
    }

    if (this.form.valid) {
      console.log('Form Value:', this.form.value);
      
      // Log image file information for debugging
      this.variants.controls.forEach((variant, vIndex) => {
        const images = this.getVariantImages(vIndex);
        console.log(`Variant ${vIndex} images:`, 
          images.controls.map((img, iIndex) => ({
            index: iIndex,
            fileName: img.get('file')?.value?.name,
            fileSize: this.getReadableFileSize(img.get('file')?.value?.size || 0)
          }))
        );
      });

      // Here you would typically submit to your API
      this.submitForm();
    } else {
      console.log('Form is invalid - showing errors');
      this.markFormGroupTouched(this.form);
      this.scrollToFirstError();
      
      // Show validation message
      this.showValidationMessage(
        `Please fix ${this.getErrorCount()} error(s) before submitting.`, 
        'warning'
      );
    }
  }

  // Method to submit the form (replace with your actual submission logic)
  private submitForm() {
    // Show success message or navigate to success page
    console.log('Submitting form...');
    
    // Example: Show success message
    this.showValidationMessage('Form submitted successfully!', 'success');
    
    // Example: Reset form after successful submission
    this.resetForm();
  }

  // Enhanced scroll to first error with smooth animation
  scrollToFirstError() {
    setTimeout(() => {
      const selectors = [
        '.is-invalid',
        '.alert-danger',
        '.alert-warning',
        '.ng-invalid.ng-touched'
      ];
      
      for (const selector of selectors) {
        const firstErrorElement = document.querySelector(selector) as HTMLElement;
        if (firstErrorElement) {
          // Scroll with offset for fixed headers
          const elementTop = firstErrorElement.offsetTop;
          const offset = 100; // Adjust based on your header height
          
          window.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth'
          });
          
          // Focus the element if it's an input
          if (firstErrorElement.tagName === 'INPUT' || firstErrorElement.tagName === 'TEXTAREA') {
            firstErrorElement.focus();
          }
          
          // Add a highlight animation
          firstErrorElement.classList.add('validation-highlight');
          setTimeout(() => {
            firstErrorElement.classList.remove('validation-highlight');
          }, 2000);
          
          break;
        }
      }
    }, 100);
  }

  // Show validation messages with different types
  private showValidationMessage(message: string, type: 'error' | 'success' | 'warning' = 'error') {
    // Simple implementation - replace with your preferred notification system
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Example with browser notification:
    // this.notificationService.show(message, type);
    
    // Example with toast:
    // this.toastr[type](message);
  }

  // Enhanced form group touched marking with focus management
  private markFormGroupTouched(formGroup: FormGroup, focusFirst = true) {
    let firstInvalidControl: HTMLElement | null = null;
    
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control, false);
      } else if (control instanceof FormArray) {
        control.markAsTouched({ onlySelf: true });
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl, false);
          } else {
            arrayControl.markAsTouched({ onlySelf: true });
          }
        });
      }

      // Find first invalid field for focusing
      if (focusFirst && !firstInvalidControl && control?.invalid) {
        setTimeout(() => {
          const element = document.querySelector(`[formControlName="${field}"]`) as HTMLElement;
          if (element) {
            element.focus();
            firstInvalidControl = element;
          }
        }, 100);
      }
    });
  }

  // Reset form to initial state
  resetForm() {
    this.form.reset();
    this.isFormSubmitAttempted = false;
    this.processingImages = {};
    this.imageErrors = {};
    this.selectedImage = null;
    
    // Recreate initial form structure
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
}