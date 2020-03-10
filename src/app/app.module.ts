import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { 
  MatListModule, 
  MatToolbarModule, 
  MatButtonModule, 
  MatSidenavModule, 
  MatIconModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material';
import { NavigationComponent } from './navigation/navigation.component';
import { DownloadTokenModule } from './download-token/download-token.module';
import { PlayTokenModule } from './play-token/play-token.module';
import { NavigationModule } from './navigation/navigation.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    DownloadTokenModule,
    PlayTokenModule,
    NavigationModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
