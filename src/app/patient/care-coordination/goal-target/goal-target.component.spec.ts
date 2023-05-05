import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalTargetComponent } from './goal-target.component';

describe('GoalTargetComponent', () => {
  let component: GoalTargetComponent;
  let fixture: ComponentFixture<GoalTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalTargetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
