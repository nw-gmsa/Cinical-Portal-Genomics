import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Extension, PlanDefinitionAction} from "fhir/r4";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatLegacyTableDataSource as MatTableDataSource} from "@angular/material/legacy-table";
import {MatSort} from "@angular/material/sort";
import {LoadingMode, LoadingStrategy, LoadingType, TdLoadingService} from "@covalent/core/loading";
import {FhirService} from "../../../services/fhir.service";
import {ResourceDialogComponent} from "../../../dialogs/resource-dialog/resource-dialog.component";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
@Component({
  selector: 'app-plan-definition-action',
  templateUrl: './plan-definition-action.component.html',
  styleUrls: ['./plan-definition-action.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class PlanDefinitionActionComponent implements OnInit {

  @Input()
  actions: PlanDefinitionAction[] = []

  @Input()
  expandedElement: null | PlanDefinitionAction | undefined;





  // @ts-ignore
  dataSource: MatTableDataSource<PlanDefinitionAction>;
  @ViewChild(MatSort) sort: MatSort | undefined;

  displayedColumns = [ 'title','code', 'input','output', 'resource'];

  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  loadingMode = LoadingMode;
  loadingStrategy = LoadingStrategy;
  loadingType = LoadingType;

  constructor(
      private _loadingService: TdLoadingService,
      public dialog: MatDialog,
      public fhirService: FhirService) { }

  ngOnInit(): void {
        this.dataSource = new MatTableDataSource<PlanDefinitionAction>(this.actions);
  }

  select(resource: any): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      resource
    };
    const resourceDialog: MatDialogRef<ResourceDialogComponent> = this.dialog.open( ResourceDialogComponent, dialogConfig);
  }

  getDefinition(extensions: Extension[]) {
    if (extensions === undefined) return "";
    for(let extension of extensions) {
      if (extension.url === 'http://england.nhs.uk/fhir/StructureDefinition/workflow-supportingInfo') {
        return '(' +extension.valueReference?.display +')';
      }
    }
    return "(nowt)"
  }
}
