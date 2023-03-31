import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralRequestTasksComponent } from './referral-request-tasks.component';

describe('ReferralRequestTasksComponent', () => {
  let component: ReferralRequestTasksComponent;
  let fixture: ComponentFixture<ReferralRequestTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferralRequestTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralRequestTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
