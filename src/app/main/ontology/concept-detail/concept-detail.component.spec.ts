import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptDetailComponent } from './concept-detail.component';

describe('ConceptDetailComponent', () => {
  let component: ConceptDetailComponent;
  let fixture: ComponentFixture<ConceptDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConceptDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
