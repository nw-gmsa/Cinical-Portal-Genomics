import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateFhirComponent } from './validate-fhir.component';

describe('ValidateFhirComponent', () => {
  let component: ValidateFhirComponent;
  let fixture: ComponentFixture<ValidateFhirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateFhirComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateFhirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
