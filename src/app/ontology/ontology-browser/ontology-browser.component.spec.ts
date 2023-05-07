import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyBrowserComponent } from './ontology-browser.component';

describe('OntologyBrowserComponent', () => {
  let component: OntologyBrowserComponent;
  let fixture: ComponentFixture<OntologyBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyBrowserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologyBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
