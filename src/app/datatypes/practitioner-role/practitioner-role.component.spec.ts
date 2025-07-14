import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerRoleComponent } from './practitioner-role.component';

describe('PractitionerRoleComponent', () => {
  let component: PractitionerRoleComponent;
  let fixture: ComponentFixture<PractitionerRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PractitionerRoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PractitionerRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
