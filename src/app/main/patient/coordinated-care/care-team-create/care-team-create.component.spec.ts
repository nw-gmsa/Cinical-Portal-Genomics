import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareTeamCreateComponent } from './care-team-create.component';

describe('CareTeamCreateComponent', () => {
  let component: CareTeamCreateComponent;
  let fixture: ComponentFixture<CareTeamCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CareTeamCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CareTeamCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
