import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticReportDetailComponent } from './diagnostic-report-detail.component';

describe('DiagnosticReportDetailComponent', () => {
  let component: DiagnosticReportDetailComponent;
  let fixture: ComponentFixture<DiagnosticReportDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosticReportDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
