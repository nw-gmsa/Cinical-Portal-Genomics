import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatedCareComponent } from './coordinated-care.component';

describe('CoordinatedCareComponent', () => {
  let component: CoordinatedCareComponent;
  let fixture: ComponentFixture<CoordinatedCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoordinatedCareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinatedCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
