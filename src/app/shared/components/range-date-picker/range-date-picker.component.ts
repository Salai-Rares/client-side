import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';

export interface DateRange {
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
}

@Component({
  selector: 'app-range-date-picker',
  imports: [NgbModule],
  templateUrl: './range-date-picker.component.html',
  styleUrl: './range-date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeDatePickerComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class RangeDatePickerComponent implements ControlValueAccessor {
  @Input() minDate!: NgbDate;

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = null;
  toDate: NgbDate | null = null;

  private onChange: (value: DateRange) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private calendar: NgbCalendar) {
    this.minDate = this.calendar.getToday();
  }

  writeValue(value: DateRange | null): void {
    if (value) {
      this.fromDate = value.fromDate;
      this.toDate = value.toDate;
    } else {
      this.fromDate = this.toDate = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // you could disable the datepicker if needed
  }

  onDateSelection(date: NgbDate) {
    // Case 1: no selection → set fromDate
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    }
    // Case 2: selecting end date
    else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else if (this.fromDate && !this.toDate && date.equals(this.fromDate)) {
      this.fromDate = null;
      this.toDate = null;
    }
    // Case 3: clicked on the same end date → clear selection
    else if (
      this.fromDate &&
      this.toDate &&
      (date.equals(this.toDate) || date.equals(this.fromDate))
    ) {
      this.fromDate = null;
      this.toDate = null;
    }
    // Case 4: fallback → start a new selection
    else {
      this.toDate = null;
      this.fromDate = date;
    }

    this.onChange({ fromDate: this.fromDate, toDate: this.toDate });
    this.onTouched();
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return (
      this.toDate && date.after(this.fromDate!) && date.before(this.toDate)
    );
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate!) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }
}
