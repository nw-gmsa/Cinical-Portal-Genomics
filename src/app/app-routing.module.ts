import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CovalentLayoutModule} from "@covalent/core/layout";
import {CovalentHighlightModule} from "@covalent/highlight";
import {CovalentMarkdownModule} from "@covalent/markdown";
import {CovalentDynamicFormsModule} from "@covalent/dynamic-forms";

const routes: Routes = [];

function CovalentStepsModule() {

}

@NgModule({
  imports: [RouterModule.forRoot(routes),

    CovalentLayoutModule,
    // (optional) Additional Covalent Modules imports
    CovalentHighlightModule,
    CovalentMarkdownModule,
    CovalentDynamicFormsModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
