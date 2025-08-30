import { Component, OnInit } from '@angular/core';
import { FilterService } from './services/filtering.service';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';


@Component({
    selector: 'app-products-grid',
    templateUrl: './products-grid.component.html',
    styleUrls: ['./products-grid.component.scss'],
    providers: [FilterService],
    standalone: false
})
export class ProductsGridComponent implements OnInit {
  filter: any;
  dynamicFormFilter!: UntypedFormGroup;
  checkedCheckboxes!: {
    key: string;
    checkboxes: { checked: boolean; count: number; value: string }[];
  }[];

  constructor(private filterService: FilterService, private fb: UntypedFormBuilder) {
    console.log('constructor called');
  }

  ngOnInit(): void {
    this.filterService.getFilters().subscribe((data) => {
      console.log('ngOnInit called');
      this.filter = data;
      console.log('filter data:');
      console.log(this.filter);
      this.createForm();
    });
  }

  createForm() {
    const formControls: any = {};
    this.filter.attributes.forEach((group: any, i: number) => {
      group.checkboxes.forEach((checkbox: any, j: number) => {
        formControls[`${i} - ${j}`] = this.fb.control(checkbox.checked);
      });
    });
    this.dynamicFormFilter = this.fb.group(formControls);
    console.log('dynamicFormFilter data:');
    console.log(this.dynamicFormFilter);
  }

  getCheckboxControl(groupIndex: number, checkboxIndex: number): UntypedFormControl {
    return this.dynamicFormFilter.get(
      `${groupIndex} - ${checkboxIndex}`
    ) as UntypedFormControl;
  }

  onCheckboxChange(groupIndex: number, checkboxIndex: number) {
    const isChecked = this.getCheckboxControl(groupIndex, checkboxIndex).value;
    this.filter.attributes[groupIndex].checkboxes[checkboxIndex].checked =
      isChecked;
    console.log(this.filter.attributes[groupIndex].checkboxes[checkboxIndex]);
    this.updateCheckedCheckboxes();
  }

  updateCheckedCheckboxes() {
    this.checkedCheckboxes = this.filter.attributes
      .map((group: any) => {
        const { checkboxes, ...newGroup } = group;

        const checboxesFiltered = checkboxes.filter(
          (checkbox: any) => checkbox.checked
        );
       
          return { checkboxes: checboxesFiltered, ...newGroup };
        
      })
      .filter((group: any) => group.checkboxes.length !== 0);
    // .flatMap((group: any) =>
    //   group.checkboxes.filter((checkbox: any) => checkbox.checked)
    // )
    // .map((checkbox: any) => checkbox.value);
    console.log(this.checkedCheckboxes);
    const paramsObject :{[key:string] : string | string[]} =  this.createParamsObject();
    const observableFiltersFromQuery = this.filterService.getFiltersWithQuery(paramsObject);
    observableFiltersFromQuery.subscribe((data)=>{
      console.log(data)
    })
  }

  private createParamsObject  (
   
  ) :{[key:string] : string | string[]}
  {
    const obj :{[key:string] : string | string[]}= {};
    this.checkedCheckboxes.forEach((group:any)=>{
      console.log(group)
      const valuesForEachKey: any[] = [];
      group.checkboxes.forEach((checkbox : any)=>{
        valuesForEachKey.push(checkbox.value)
      })
     
      obj[group.key] = valuesForEachKey;

    })
    console.log(obj)
    return obj;
  }
 
  onSubmit() {
    console.log('Form Values:', this.dynamicFormFilter.value);
    console.log('Names of checked checkboxes:', this.checkedCheckboxes);
    // Handle the form values as needed
  }
}
