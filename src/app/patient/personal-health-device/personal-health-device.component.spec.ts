import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalHealthDeviceComponent } from './personal-health-device.component';

describe('PersonalHealthDeviceComponent', () => {
  let component: PersonalHealthDeviceComponent;
  let fixture: ComponentFixture<PersonalHealthDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalHealthDeviceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalHealthDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
