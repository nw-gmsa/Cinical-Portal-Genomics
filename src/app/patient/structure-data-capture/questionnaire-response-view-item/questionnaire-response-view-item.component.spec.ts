import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireResponseViewItemComponent } from './questionnaire-response-view-item.component';

describe('QuestionnaireResponseViewItemComponent', () => {
  let component: QuestionnaireResponseViewItemComponent;
  let fixture: ComponentFixture<QuestionnaireResponseViewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireResponseViewItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireResponseViewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
