import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuredDataCaptueComponent } from './structured-data-captue.component';

describe('StructuredDataCaptueComponent', () => {
  let component: StructuredDataCaptueComponent;
  let fixture: ComponentFixture<StructuredDataCaptueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructuredDataCaptueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructuredDataCaptueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
