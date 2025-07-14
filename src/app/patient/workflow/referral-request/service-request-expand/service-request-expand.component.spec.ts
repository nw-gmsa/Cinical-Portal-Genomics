import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRequestExpandComponent } from './service-request-expand.component';

describe('ServiceRequestExpandComponent', () => {
  let component: ServiceRequestExpandComponent;
  let fixture: ComponentFixture<ServiceRequestExpandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRequestExpandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceRequestExpandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
