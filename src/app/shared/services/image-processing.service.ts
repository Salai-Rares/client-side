import { Injectable } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ProcessedImage {
  file: File;
  preview: string;
  isValid: boolean;
  error?: string;
}

export interface ImageValidationConfig {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {

  private readonly DEFAULT_CONFIG: ImageValidationConfig = {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth: 4000,
    maxHeight: 4000,
    minWidth: 50,
    minHeight: 50
  };

  constructor() {
    console.debug('[ImageSvc] ctor');
  }

  /**
   * Process multiple files and return observable of processed images
   */
  processFiles(files: FileList | File[], config?: ImageValidationConfig): Observable<ProcessedImage[]> {
    const fileArray = Array.from(files);
    const validationConfig = { ...this.DEFAULT_CONFIG, ...config };

    console.debug('[ImageSvc] processFiles START | files:', fileArray.map(f => `${f.name} (${f.type}, ${f.size}b)`));
    console.debug('[ImageSvc] merged config:', validationConfig);

    if (fileArray.length === 0) {
      console.debug('[ImageSvc] processFiles: no files, returning []');
      return of([]);
    }

    const processPromises = fileArray.map(file => {
      console.debug('[ImageSvc] queue processFile ->', file.name);
      return this.processFile(file, validationConfig);
    });

    // Timing entire batch
    console.time('[ImageSvc] processFiles total');
    const result$ = forkJoin(processPromises);
    // Add a terminal log when subscribed (component subscribes)
    // Note: we can’t tap here without changing operators; rely on component logs for completion timing.
    return result$;
  }

  /**
   * Process a single file
   */
  private processFile(file: File, config: ImageValidationConfig): Observable<ProcessedImage> {
    console.debug('[ImageSvc] processFile START ->', file.name);
    return from(this.validateAndProcessImage(file, config)).pipe(
      catchError(error => {
        console.error('[ImageSvc] processFile ERROR ->', file.name, error);
        return of({
          file,
          preview: '',
          isValid: false,
          error: (error as Error).message || 'Unknown error processing image'
        });
      })
    );
  }

  /**
   * Validate and process a single image file
   */
  private async validateAndProcessImage(file: File, config: ImageValidationConfig): Promise<ProcessedImage> {
    console.debug('[ImageSvc] validateAndProcessImage START ->', file.name);
    const basicValidation = this.validateFileBasics(file, config);
    if (!basicValidation.isValid) {
      console.warn('[ImageSvc] basic validation FAILED ->', file.name, basicValidation.error);
      return {
        file,
        preview: '',
        isValid: false,
        error: basicValidation.error
      };
    }

    try {
      console.time(`[ImageSvc] ${file.name} createPreview`);
      const preview = await this.createImagePreview(file);
      console.timeEnd(`[ImageSvc] ${file.name} createPreview`);
      console.time(`[ImageSvc] ${file.name} validateDimensions`);
      const dimensionValidation = await this.validateImageDimensions(file, config);
      console.timeEnd(`[ImageSvc] ${file.name} validateDimensions`);

      if (!dimensionValidation.isValid) {
        console.warn('[ImageSvc] dimension validation FAILED ->', file.name, dimensionValidation.error);
        return {
          file,
          preview,
          isValid: false,
          error: dimensionValidation.error
        };
      }

      console.debug('[ImageSvc] validateAndProcessImage OK ->', file.name);
      console.timeEnd('[ImageSvc] processFiles total'); // ends on the last file to finish (ok for rough timing)
      return {
        file,
        preview,
        isValid: true
      };
    } catch (error) {
      console.error('[ImageSvc] validateAndProcessImage CATCH ->', file.name, error);
      console.timeEnd('[ImageSvc] processFiles total');
      return {
        file,
        preview: '',
        isValid: false,
        error: 'Failed to process image: ' + (error as Error).message
      };
    }
  }

  /**
   * Validate basic file properties (type, size)
   */
  private validateFileBasics(file: File, config: ImageValidationConfig): { isValid: boolean; error?: string } {
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      const msg = `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`;
      console.warn('[ImageSvc] validateFileBasics type FAIL ->', file.name, file.type, msg);
      return { isValid: false, error: msg };
    }

    if (config.maxSizeInMB) {
      const maxSizeInBytes = config.maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        const msg = `File too large. Maximum size: ${config.maxSizeInMB}MB`;
        console.warn('[ImageSvc] validateFileBasics size FAIL ->', file.name, file.size, msg);
        return { isValid: false, error: msg };
      }
    }

    console.debug('[ImageSvc] validateFileBasics OK ->', file.name);
    return { isValid: true };
  }

  /**
   * Create base64 preview string
   */
  private createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      console.debug('[ImageSvc] createImagePreview START ->', file.name);

      reader.onload = () => {
        console.debug('[ImageSvc] createImagePreview onload ->', file.name, 'bytes:', (reader.result as string)?.length ?? 0);
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        console.error('[ImageSvc] createImagePreview onerror ->', file.name);
        reject(new Error('Failed to read file'));
      };

      // Debug: catch aborts that can leave promises pending in some flows
      reader.onabort = () => {
        console.warn('[ImageSvc] createImagePreview onabort ->', file.name);
        reject(new Error('File read aborted'));
      };

      try {
        reader.readAsDataURL(file);
      } catch (e) {
        console.error('[ImageSvc] createImagePreview readAsDataURL threw ->', file.name, e);
        reject(e as Error);
      }
    });
  }

  /**
   * Validate image dimensions
   */
  private validateImageDimensions(file: File, config: ImageValidationConfig): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      let revoked = false;

      const cleanup = () => {
        if (!revoked) {
          URL.revokeObjectURL(url);
          revoked = true;
          console.debug('[ImageSvc] validateImageDimensions revokeObjectURL ->', file.name);
        }
      };

      console.debug('[ImageSvc] validateImageDimensions START ->', file.name);

      img.onload = () => {
        cleanup();
        const { naturalWidth: width, naturalHeight: height } = img;
        console.debug('[ImageSvc] validateImageDimensions onload ->', file.name, { width, height });

        if (config.minWidth && width < config.minWidth) {
          resolve({ isValid: false, error: `Image width too small. Minimum: ${config.minWidth}px` });
          return;
        }
        if (config.minHeight && height < config.minHeight) {
          resolve({ isValid: false, error: `Image height too small. Minimum: ${config.minHeight}px` });
          return;
        }
        if (config.maxWidth && width > config.maxWidth) {
          resolve({ isValid: false, error: `Image width too large. Maximum: ${config.maxWidth}px` });
          return;
        }
        if (config.maxHeight && height > config.maxHeight) {
          resolve({ isValid: false, error: `Image height too large. Maximum: ${config.maxHeight}px` });
          return;
        }
        resolve({ isValid: true });
      };

      img.onerror = () => {
        cleanup();
        console.error('[ImageSvc] validateImageDimensions onerror ->', file.name);
        resolve({ isValid: false, error: 'Invalid image file' });
      };

      // Debug: handle abort explicitly so the Promise resolves and doesn’t hang
      img.onabort = () => {
        cleanup();
        console.warn('[ImageSvc] validateImageDimensions onabort ->', file.name);
        resolve({ isValid: false, error: 'Image load aborted' });
      };

      try {
        img.src = url;
        console.debug('[ImageSvc] validateImageDimensions set src ->', file.name);
      } catch (e) {
        cleanup();
        console.error('[ImageSvc] validateImageDimensions set src threw ->', file.name, e);
        resolve({ isValid: false, error: 'Invalid image file' });
      }
    });
  }

  /**
   * Get human-readable file size
   */
  getReadableFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }

  /**
   * Check if file is a valid image type
   */
  isValidImageType(file: File, allowedTypes?: string[]): boolean {
    const types = allowedTypes || this.DEFAULT_CONFIG.allowedTypes || [];
    const valid = types.includes(file.type);
    console.debug('[ImageSvc] isValidImageType ->', file.name, file.type, '=>', valid);
    return valid;
  }
}
