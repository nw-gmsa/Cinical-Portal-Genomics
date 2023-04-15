import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDefinitionDetailComponent } from './activity-definition-detail.component';

describe('ActivityDefinitionDetailComponent', () => {
  let component: ActivityDefinitionDetailComponent;
  let fixture: ComponentFixture<ActivityDefinitionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityDefinitionDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDefinitionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
