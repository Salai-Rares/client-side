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

  constructor() { }

  /**
   * Process multiple files and return observable of processed images
   */
  processFiles(files: FileList | File[], config?: ImageValidationConfig): Observable<ProcessedImage[]> {
    const fileArray = Array.from(files);
    const validationConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    if (fileArray.length === 0) {
      return of([]);
    }

    const processPromises = fileArray.map(file => this.processFile(file, validationConfig));
    
    return forkJoin(processPromises);
  }

  /**
   * Process a single file
   */
  private processFile(file: File, config: ImageValidationConfig): Observable<ProcessedImage> {
    return from(this.validateAndProcessImage(file, config)).pipe(
      catchError(error => of({
        file,
        preview: '',
        isValid: false,
        error: error.message || 'Unknown error processing image'
      }))
    );
  }

  /**
   * Validate and process a single image file
   */
  private async validateAndProcessImage(file: File, config: ImageValidationConfig): Promise<ProcessedImage> {
    // Basic file validation
    const basicValidation = this.validateFileBasics(file, config);
    if (!basicValidation.isValid) {
      return {
        file,
        preview: '',
        isValid: false,
        error: basicValidation.error
      };
    }

    try {
      // Create preview and validate dimensions
      const preview = await this.createImagePreview(file);
      const dimensionValidation = await this.validateImageDimensions(file, config);
      
      if (!dimensionValidation.isValid) {
        return {
          file,
          preview,
          isValid: false,
          error: dimensionValidation.error
        };
      }

      return {
        file,
        preview,
        isValid: true
      };
    } catch (error) {
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
    // Check file type
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    // Check file size
    if (config.maxSizeInMB) {
      const maxSizeInBytes = config.maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return {
          isValid: false,
          error: `File too large. Maximum size: ${config.maxSizeInMB}MB`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Create base64 preview string
   */
  private createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image dimensions
   */
  private validateImageDimensions(file: File, config: ImageValidationConfig): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url); // Clean up
        
        const { naturalWidth: width, naturalHeight: height } = img;
        
        // Check minimum dimensions
        if (config.minWidth && width < config.minWidth) {
          resolve({
            isValid: false,
            error: `Image width too small. Minimum: ${config.minWidth}px`
          });
          return;
        }
        
        if (config.minHeight && height < config.minHeight) {
          resolve({
            isValid: false,
            error: `Image height too small. Minimum: ${config.minHeight}px`
          });
          return;
        }
        
        // Check maximum dimensions
        if (config.maxWidth && width > config.maxWidth) {
          resolve({
            isValid: false,
            error: `Image width too large. Maximum: ${config.maxWidth}px`
          });
          return;
        }
        
        if (config.maxHeight && height > config.maxHeight) {
          resolve({
            isValid: false,
            error: `Image height too large. Maximum: ${config.maxHeight}px`
          });
          return;
        }
        
        resolve({ isValid: true });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          error: 'Invalid image file'
        });
      };
      
      img.src = url;
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
    return types.includes(file.type);
  }
}