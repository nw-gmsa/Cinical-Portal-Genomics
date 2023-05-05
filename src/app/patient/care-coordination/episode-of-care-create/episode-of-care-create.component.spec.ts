import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeOfCareCreateComponent } from './episode-of-care-create.component';

describe('EpisodeOfCareCreateComponent', () => {
  let component: EpisodeOfCareCreateComponent;
  let fixture: ComponentFixture<EpisodeOfCareCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpisodeOfCareCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpisodeOfCareCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
