import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticReportCreateComponent } from './diagnostic-report-create.component';

describe('DiagnosticReportCreateComponent', () => {
  let component: DiagnosticReportCreateComponent;
  let fixture: ComponentFixture<DiagnosticReportCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosticReportCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticReportCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
