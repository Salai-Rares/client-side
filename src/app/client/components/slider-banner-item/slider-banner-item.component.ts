import { Component, OnInit , Input} from '@angular/core';

@Component({
  selector: 'app-slider-banner-item',
  templateUrl: './slider-banner-item.component.html',
  styleUrls: ['./slider-banner-item.component.scss']
})
export class SliderBannerItemComponent implements OnInit {
  @Input() imgSrc : string = ' ';
  constructor() { }

  ngOnInit(): void {
  }

}
