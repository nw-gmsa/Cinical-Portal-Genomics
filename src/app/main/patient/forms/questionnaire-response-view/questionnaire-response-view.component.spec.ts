import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireResponseViewComponent } from './questionnaire-response-view.component';

describe('QuestionnaireResponseViewComponent', () => {
  let component: QuestionnaireResponseViewComponent;
  let fixture: ComponentFixture<QuestionnaireResponseViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireResponseViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireResponseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
