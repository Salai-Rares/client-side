import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderBannerItemComponent } from './slider-banner-item.component';

describe('SliderBannerItemComponent', () => {
  let component: SliderBannerItemComponent;
  let fixture: ComponentFixture<SliderBannerItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderBannerItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderBannerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
