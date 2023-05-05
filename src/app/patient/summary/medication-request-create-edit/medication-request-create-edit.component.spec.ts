import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationRequestCreateEditComponent } from './medication-request-create-edit.component';

describe('MedicationRequestCreateEditComponent', () => {
  let component: MedicationRequestCreateEditComponent;
  let fixture: ComponentFixture<MedicationRequestCreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationRequestCreateEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationRequestCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
