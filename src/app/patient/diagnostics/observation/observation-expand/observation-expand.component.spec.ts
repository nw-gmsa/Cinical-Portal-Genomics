import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationExpandComponent } from './observation-expand.component';

describe('ObservationExpandComponent', () => {
  let component: ObservationExpandComponent;
  let fixture: ComponentFixture<ObservationExpandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservationExpandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObservationExpandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
