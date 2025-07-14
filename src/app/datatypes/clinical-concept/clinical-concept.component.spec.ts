import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalConceptComponent } from './clinical-concept.component';

describe('ClinicalConceptComponent', () => {
  let component: ClinicalConceptComponent;
  let fixture: ComponentFixture<ClinicalConceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalConceptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClinicalConceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
