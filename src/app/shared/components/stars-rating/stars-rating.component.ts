import { Component, OnInit ,Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder,Validators } from '@angular/forms';
@Component({
    selector: 'app-stars-rating',
    templateUrl: './stars-rating.component.html',
    styleUrls: ['./stars-rating.component.scss'],
    standalone: false
})
export class StarsRatingComponent implements OnInit {
  public form!: UntypedFormGroup;
  @Input() rating: number[]=[1];
  @Input() isDisabled : boolean = true;
  @Input() starId : string = '1';
  constructor(private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      rating: this.rating
    });
  }

}
