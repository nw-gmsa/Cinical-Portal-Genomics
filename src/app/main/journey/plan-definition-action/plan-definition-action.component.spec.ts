import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDefinitionActionComponent } from './plan-definition-action.component';

describe('PlanDefinitionActionComponent', () => {
  let component: PlanDefinitionActionComponent;
  let fixture: ComponentFixture<PlanDefinitionActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanDefinitionActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanDefinitionActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
