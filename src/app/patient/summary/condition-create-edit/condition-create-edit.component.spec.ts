import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionCreateEditComponent } from './condition-create-edit.component';

describe('ConditionCreateEditComponent', () => {
  let component: ConditionCreateEditComponent;
  let fixture: ComponentFixture<ConditionCreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConditionCreateEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConditionCreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
