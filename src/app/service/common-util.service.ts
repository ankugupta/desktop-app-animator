import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as urlLib from 'url';

import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

//const electron = (<any>window).require('electron');
const win = (<any>window);
@Injectable({
  providedIn: 'root'
})
export class CommonUtilService {
  //electron/native imports
  ipcRenderer: typeof ipcRenderer;
  fs: typeof fs;
  urlLib: typeof urlLib;
  path: typeof path;

  appUpdaterSubject: BehaviorSubject<string> = new BehaviorSubject("");


  get isElectron(): boolean {
    return !!(win && win.process && win.process.type);
  }

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = win.require('electron').ipcRenderer;
      this.fs = win.require('fs');
      this.path = win.require('path');
      this.urlLib = win.require('url');

      this.subscribeToElectronUpdaterEvents();
    }

  }
  //subscribe to channel on which app update events are published
  //feed values to subject
  private subscribeToElectronUpdaterEvents() {

    this.ipcRenderer.on("updater-message", (event, message: string, info: any) => {
      if (message == 'UPDATE_AVAILABLE') {
        message = 'Update Available';
        if (info && info.version) {
          message = `Update Available : Version ${info.version}`;
        }
        this.appUpdaterSubject.next(message);
      }
      else if (message == 'UPDATE_DOWNLOADED') {
        message = 'Update Downloaded';
        if (info && info.version) {
          message = `Update Downloaded : Version ${info.version} <br> App will update itself on next restart`;
        }
        this.appUpdaterSubject.next(message);

      }
    });

  }


  //allow subscribers access to app updater events
  public getAppUpdationAsObservable(): Observable<string> {
    return this.appUpdaterSubject.asObservable();
  }

  //node api - fs
  public isFileExists(url: string) {
    if (url.startsWith('file:///')) {
      url = url.substring('file:///'.length);
    }
    if (url.indexOf('%') > -1) {
      url = decodeURI(url);
    }
    return this.fs.existsSync(url);
  }

  //node api - path
  public getPathDirname(path: string): string {
    //path.dirname('/foo/bar/baz/asdf/quux');
    // Returns: '/foo/bar/baz/asdf'

    return this.path.dirname(path);
  }

  //node api - path
  public joinPaths(...paths: string[]): string {
    return this.path.join(...paths);
  }

  //node api - url
  public formatUrl(path: string): string {
    return this.urlLib.format({
      pathname: path,
      protocol: 'file:',
      slashes: true
    });
  }

  //node api in main - unzipper
  public unzipContent(srcPath: string, destPath: string): Promise<void> {

    return ipcRenderer.invoke('unzip-file', srcPath, destPath).then(
      (result: UnzipContentResult) => {
        if (result.status == 'success') {
          return;
        }
        else {
          throw result.err;
        }
      }
    );
  }


  //node api in main - del
  public deleteFileDirAtPath(path: string): Promise<void> {
    console.log(`deleting file/directory at: ${path}`);

    return ipcRenderer.invoke('delete-file', path).then(
      (result) => {
        if (result.status == 'success') {
          return;
        }
        else {
          throw result.err;
        }
      }
    );
  }


}

export interface UnzipContentResult {
  status: 'success' | 'error',
  srcPath: string,
  destPath: string,
  err?: any
}