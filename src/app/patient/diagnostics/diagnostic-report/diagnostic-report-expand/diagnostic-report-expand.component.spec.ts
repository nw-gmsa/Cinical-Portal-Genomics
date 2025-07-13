import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticReportExpandComponent } from './diagnostic-report-expand.component';

describe('DiagnosticReportExpandComponent', () => {
  let component: DiagnosticReportExpandComponent;
  let fixture: ComponentFixture<DiagnosticReportExpandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticReportExpandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiagnosticReportExpandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
