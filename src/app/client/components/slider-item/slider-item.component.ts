import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-slider-item',
    templateUrl: './slider-item.component.html',
    styleUrls: ['./slider-item.component.scss'],
    standalone: false
})
export class SliderItemComponent implements OnInit {
  @Input() imagePath?: string;
  @Input() starID: string = 's';
  @Input() rating: number[] = [4];
  @Input() isOneSlidePerView: boolean = true;
  @Input() productName: string = ' ';
  @Input() isDisabled: boolean = true;

  constructor() {}
  ngOnInit(): void {}
}
