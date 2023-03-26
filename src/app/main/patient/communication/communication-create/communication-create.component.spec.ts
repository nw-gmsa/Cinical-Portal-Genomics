import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationCreateComponent } from './communication-create.component';

describe('CommunicationCreateComponent', () => {
  let component: CommunicationCreateComponent;
  let fixture: ComponentFixture<CommunicationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunicationCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
