import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.css']
})
export class DateInputComponent implements ControlValueAccessor {
  @Input() label: string;
  @Input() maxDate: Date;
  @Input() iconClass: string;
  bsConfig?: Partial<BsDatepickerConfig>;
  colorTheme = 'theme-red';

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
    this.bsConfig = Object.assign({}, {
      containerClass: this.colorTheme,
      dateInputFormat: 'DD-MMMM-YYYY',
      showTodayButton: true,
      todayPosition: 'center',
      adaptivePosition: true,
      isAnimated: true
    });
  }

  writeValue(obj: any): void {

  }
  registerOnChange(fn: any): void {

  }
  registerOnTouched(fn: any): void {

  }




}
