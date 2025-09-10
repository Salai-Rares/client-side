import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import {
  ImageProcessingService,
  ImageValidationConfig,
  ProcessedImage,
} from '../../services/image-processing.service';
import { A11yModule } from '@angular/cdk/a11y';

interface ImageUploadConfig extends ImageValidationConfig {
  label?: string;
  placeholder?: string;
  minImages?: number;
  maxImages?: number;
  haveBorder?: boolean;
}

@Component({
  selector: 'app-image-selector',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, A11yModule],
  templateUrl: './image-selector.component.html',
  styleUrl: './image-selector.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageSelectorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ImageSelectorComponent
  implements ControlValueAccessor, OnInit, OnDestroy, AfterViewChecked
{
  @Input() config: ImageUploadConfig = {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxWidth: 2000,
    maxHeight: 2000,
    minWidth: 100,
    minHeight: 100,
  };

  formArray: FormArray = this.fb.array([]);
  isDragOver = false;
  isProcessing = false;
  imageErrors: string[] = [];
  selectedImage: string | null = null;

  @ViewChild('closeModalButton')
  closeModalButton?: ElementRef<HTMLButtonElement>;

  private destroy$ = new Subject<void>();

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(
    private fb: FormBuilder,
    private imageProcessingService: ImageProcessingService,
    private readonly cdr: ChangeDetectorRef
  ) {
    console.debug('[ImageSelector] ctor');
  }

  ngAfterViewChecked(): void {
    // Note: fires often; keep log conditional to avoid noise
    if (this.selectedImage && this.closeModalButton) {
      console.debug(
        '[ImageSelector] ngAfterViewChecked -> focusing close button for modal'
      );
      this.closeModalButton.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    console.debug('[ImageSelector] ngOnInit');
    // Set up value changes subscription with proper cleanup
    this.formArray.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        console.debug(
          '[ImageSelector] formArray.valueChanges -> length:',
          Array.isArray(value) ? value.length : value
        );
        this.onChange(value);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    console.debug('[ImageSelector] ngOnDestroy');
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    console.debug('[ImageSelector] writeValue called with:', value);
    this.formArray.clear();
    if (value && Array.isArray(value)) {
      value.forEach((item) => {
        this.formArray.push(this.createImageGroup(item.file, item.preview));
      });
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: any): void {
    console.debug('[ImageSelector] registerOnChange');
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    console.debug('[ImageSelector] registerOnTouched');
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    console.debug('[ImageSelector] setDisabledState:', isDisabled);
    if (isDisabled) {
      this.formArray.disable();
    } else {
      this.formArray.enable();
    }
  }

  // Drag & drop / selection
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.isDragOver) {
      console.debug('[ImageSelector] onDragOver');
    }
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    console.debug('[ImageSelector] onDragLeave');
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    console.debug('[ImageSelector] onDrop -> files:', files?.length ?? 0);
    if (files && files.length > 0) {
      this.handleFileInput(files);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    console.debug(
      '[ImageSelector] onImageSelected -> files:',
      files?.length ?? 0
    );
    if (files && files.length > 0) {
      this.handleFileInput(files);
    }
    input.value = '';
  }

  private handleFileInput(files: FileList): void {
    const batchId = `batch-${Date.now()}`;
    console.debug(
      `[ImageSelector] handleFileInput START (${batchId}) | files:`,
      Array.from(files).map((f) => `${f.name} (${f.type}, ${f.size}b)`)
    );

    this.isProcessing = true;
    this.imageErrors = [];
    this.onTouched();

    console.debug(
      `[ImageSelector] (${batchId}) calling processFiles with config:`,
      this.config
    );
    this.imageProcessingService.processFiles(files, this.config).subscribe({
      next: (processedImages: ProcessedImage[]) => {
        console.debug(
          `[ImageSelector] (${batchId}) processFiles next -> count:`,
          processedImages?.length ?? 0
        );

        const validImages = processedImages.filter((img) => img.isValid);
        const invalidImages = processedImages.filter((img) => !img.isValid);

        console.debug(
          `[ImageSelector] (${batchId}) valid: ${validImages.length} | invalid: ${invalidImages.length}`
        );

        validImages.forEach((processedImage) => {
          console.debug(
            `[ImageSelector] (${batchId}) pushing valid image:`,
            processedImage.file?.name
          );
          const imageGroup = this.createImageGroup(
            processedImage.file,
            processedImage.preview
          );
          this.formArray.push(imageGroup);
        });

        if (invalidImages.length > 0) {
          this.imageErrors = invalidImages.map(
            (img) => `${img.file.name}: ${img.error}`
          );
          console.warn(
            `[ImageSelector] (${batchId}) invalid images:`,
            this.imageErrors
          );
        }

        this.isProcessing = false;
        console.debug(
          `[ImageSelector] (${batchId}) isProcessing ->`,
          this.isProcessing
        );
        // this.onChange(this.formArray.value);
      },
      error: (error) => {
        console.error(
          `[ImageSelector] (${batchId}) processFiles ERROR:`,
          error
        );
        this.imageErrors = ['Failed to process images. Please try again.'];
        this.isProcessing = false;
        console.debug(
          `[ImageSelector] (${batchId}) isProcessing ->`,
          this.isProcessing
        );
      },
      // Note: no 'complete' handler here; logging handled in next/error paths
    });
  }

  onImageReorder(event: CdkDragDrop<any[]>): void {
    const { previousIndex, currentIndex } = event;
    console.debug('[ImageSelector] onImageReorder', {
      previousIndex,
      currentIndex,
    });
    const movedControl = this.formArray.at(previousIndex);
    this.formArray.removeAt(previousIndex);
    this.formArray.insert(currentIndex, movedControl);
    // this.onChange(this.formArray.value);
  }

  removeImage(index: number): void {
    console.debug('[ImageSelector] removeImage index:', index);
    this.formArray.removeAt(index);
    // this.onChange(this.formArray.value);
    this.onTouched();
  }

  clearImageErrors(): void {
    console.debug('[ImageSelector] clearImageErrors');
    this.imageErrors = [];
  }

  openImageModal(imageSrc: string): void {
    console.debug('[ImageSelector] openImageModal');
    this.selectedImage = imageSrc;
  }

  closeImageModal(): void {
    console.debug('[ImageSelector] closeImageModal');
    this.selectedImage = null;
  }

  private createImageGroup(file: File, preview: string): FormGroup {
    console.debug(
      '[ImageSelector] createImageGroup ->',
      file?.name,
      file?.size
    );
    return this.fb.group({
      file: [file],
      preview: [preview],
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getReadableFileSize(bytes: number): string {
    return this.imageProcessingService.getReadableFileSize(bytes);
  }
}
