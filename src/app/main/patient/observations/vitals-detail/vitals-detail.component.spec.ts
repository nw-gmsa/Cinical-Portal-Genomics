import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalsDetailComponent } from './vitals-detail.component';

describe('VitalsDetailComponent', () => {
  let component: VitalsDetailComponent;
  let fixture: ComponentFixture<VitalsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VitalsDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
