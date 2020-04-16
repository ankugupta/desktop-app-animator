import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as urlLib from 'url';

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
    }

  }

  //node api - fs
  public isFileExists(url: string) {
    if (url.startsWith('file:///')) {
      url = url.substring('file:///'.length);
    }
    if(url.indexOf('%') > -1){
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