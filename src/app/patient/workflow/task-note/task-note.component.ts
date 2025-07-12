import {Component, Input, OnInit} from '@angular/core';
import {Annotation} from "fhir/r4";
import {MatTableDataSource} from "@angular/material/table";


@Component({
  selector: 'app-task-note',
  templateUrl: './task-note.component.html',
  styleUrls: ['./task-note.component.scss']
})
export class TaskNoteComponent implements OnInit {

  @Input()
  annotations: Annotation[] = [];
  // @ts-ignore
  dataSource : MatTableDataSource<Annotation>;
  displayedColumns = ['time','note'];
  constructor(
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Annotation>(this.annotations);
  }

}
