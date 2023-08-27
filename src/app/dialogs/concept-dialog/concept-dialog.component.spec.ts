import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptDialogComponent } from './concept-dialog.component';

describe('ConceptDialogComponent', () => {
  let component: ConceptDialogComponent;
  let fixture: ComponentFixture<ConceptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConceptDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConceptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
