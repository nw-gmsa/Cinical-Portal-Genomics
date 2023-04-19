import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDefinitionComponent } from './activity-definition.component';

describe('ActivityDefinitionComponent', () => {
  let component: ActivityDefinitionComponent;
  let fixture: ComponentFixture<ActivityDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityDefinitionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
