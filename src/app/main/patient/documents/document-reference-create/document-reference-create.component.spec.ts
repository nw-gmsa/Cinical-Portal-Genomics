import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentReferenceCreateComponent } from './document-reference-create.component';

describe('DocumentReferenceCreateComponent', () => {
  let component: DocumentReferenceCreateComponent;
  let fixture: ComponentFixture<DocumentReferenceCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentReferenceCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentReferenceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
