import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ValueSetExpansionContains} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {FhirService} from "../../services/fhir.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-concept-list',
  templateUrl: './concept-list.component.html',
  styleUrls: ['./concept-list.component.scss']
})
export class ConceptListComponent implements OnInit {
  // @ts-ignore
  @Input() concepts: Observable<ValueSetExpansionContains[]>;
  @Output() concept = new EventEmitter<ValueSetExpansionContains>();
  // @ts-ignore
  dataSource: MatTableDataSource<ValueSetExpansionContains>;
  @ViewChild(MatSort) sort: MatSort | undefined;
  displayedColumns = ['code'];

  constructor(  public fhirService: FhirService) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<ValueSetExpansionContains>();
    this.concepts.subscribe(things => {
      this.dataSource.data = things;
    });
  }

  selectConcept(concept: ValueSetExpansionContains) {
    this.concept.emit(concept)
  }
}
