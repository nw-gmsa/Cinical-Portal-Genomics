import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunPackageTestComponent } from './run-package-test.component';

describe('RunPackageTestComponent', () => {
  let component: RunPackageTestComponent;
  let fixture: ComponentFixture<RunPackageTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunPackageTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunPackageTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
