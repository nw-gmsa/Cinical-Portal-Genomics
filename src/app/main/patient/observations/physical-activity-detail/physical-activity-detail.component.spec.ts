import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalActivityDetailComponent } from './physical-activity-detail.component';

describe('PhysicalActivityDetailComponent', () => {
  let component: PhysicalActivityDetailComponent;
  let fixture: ComponentFixture<PhysicalActivityDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicalActivityDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicalActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
