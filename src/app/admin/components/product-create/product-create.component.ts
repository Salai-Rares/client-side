import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../../client/components/products/services/products.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss']
})
export class ProductCreateComponent implements OnInit {
  @ViewChild('filePicker')
  filePicker !: ElementRef;
  enteredTitle:string = "";
  enteredDescription:string = "";
  form!:UntypedFormGroup;
  imagePreview?:string;
  

  

  constructor(private productService:ProductsService) {
    
   }

  ngOnInit(): void {
  
    this.form = new UntypedFormGroup({
      title: new UntypedFormControl(null,{
        validators:[Validators.required,Validators.minLength(3)]
      }),
      description:new UntypedFormControl(null,{validators:[Validators.required,Validators.minLength(5)]
      }),
      image: new UntypedFormControl(null,{
        validators:[Validators.required],
        asyncValidators:[mimeType]
      })
    })


  }

  onSaveProduct(){
    
    if (this.form.invalid) {
     console.log('form invalid');
     if(this.title?.errors){
      console.log(this.title.errors);
     }
     if(this.description?.errors){
      console.log(this.description.errors);
     }

     if(this.image?.errors){
      console.log(this.image.errors);
     }
     
      return;
    }
   
  
      this.productService.addProduct(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
     
    
   
    this.productService.getProductAddedObservable().subscribe((prod)=>{
      console.log('asdf' + Object.keys(prod));
      this.resetForm();
    })
    
  }

  private resetForm(){
    this.form.reset();
    this.imagePreview = '';
    this.filePicker.nativeElement.value = null;
  }

  onImagePicked(event: Event) {
    if(event.target === null ){
      console.log('event null')
      return;
    }
    const file = (event.target as HTMLInputElement).files![0];
    console.log(file.name)
    this.form.patchValue({ image: file });
    this.form.get("image")!.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      console.log(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  get title(){
    return this.form.get('title');
  }
  get description(){
    return this.form.get('description');
  }

  get image(){
    return this.form.get('image');
  }
 
}
