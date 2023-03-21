import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarePlanCreateComponent } from './care-plan-create.component';

describe('CarePlanCreateComponent', () => {
  let component: CarePlanCreateComponent;
  let fixture: ComponentFixture<CarePlanCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarePlanCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarePlanCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
