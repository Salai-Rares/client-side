import { Component, OnInit ,Input } from '@angular/core';
import { FormGroup, FormBuilder,Validators } from '@angular/forms';
@Component({
  selector: 'app-stars-rating',
  templateUrl: './stars-rating.component.html',
  styleUrls: ['./stars-rating.component.scss']
})
export class StarsRatingComponent implements OnInit {
  public form!: FormGroup;
  @Input() rating: number[]=[1];
  @Input() isDisabled : boolean = true;
  @Input() starId : string = '1';
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      rating: this.rating
    });
  }

}
