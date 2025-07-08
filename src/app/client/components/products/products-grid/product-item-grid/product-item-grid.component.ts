import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import {FilterService} from '../services/filtering.service'
@Component({
  selector: 'app-product-item-grid',
  templateUrl: './product-item-grid.component.html',
  styleUrls: ['./product-item-grid.component.scss']
})
export class ProductItemGridComponent implements OnInit {
  @Input() imagePath?:string;
  @Input() starID :string = 's';
  @Input() rating: number[]=[5];
  @Input() isOneSlidePerView : boolean = true;
  @Input() productName:string = 'Furtun (garou) din vinil pentru legat via si pomii - 3,0 mm';
  @Input() isDisabled: boolean = false;


  constructor() { }

  ngOnInit(): void {
    
  }

}
