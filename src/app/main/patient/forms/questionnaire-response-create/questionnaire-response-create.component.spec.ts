import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireResponseCreateComponent } from './questionnaire-response-create.component';

describe('QuestionnaireResponseCreateComponent', () => {
  let component: QuestionnaireResponseCreateComponent;
  let fixture: ComponentFixture<QuestionnaireResponseCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireResponseCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireResponseCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
