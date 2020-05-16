import { ipcRenderer } from 'electron';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as urlLib from 'url';
import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@angular/core';

import * as Constants from '../app.constants';
import { Book } from '../model/book.model';
import { DataService } from './data.service';
import { SqlStorageService } from './sql-storage.service';
import { CommonUtilService } from './common-util.service';

//const electron = (<any>window).require('electron');
const win = (<any>window);
@Injectable({
  providedIn: 'root'
})
export class BookService {
  //electron/native imports
  ipcRenderer: typeof ipcRenderer;
  fs: typeof fs;
  urlLib: typeof urlLib;
  path: typeof path;
  bookAccessKeyToDetailsMap: Map<string, Book> = new Map();

  booksDownloadQueue: string[] = [];
  booksDownloadedList: DownloadedItem[] = [];

  downloadeCompletionSubject: Subject<DownloadedItem> = new Subject();
  downloadProgressSubject: Subject<DownloadProgress> = new Subject();

  modalWinDisplayed = false;

  get isElectron(): boolean {
    return !!(win && win.process && win.process.type);
  }

  constructor(private data: DataService, private sqlStorage: SqlStorageService, private commonUtils: CommonUtilService) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = win.require('electron').ipcRenderer;
      this.fs = win.require('fs');
      this.path = win.require('path');
      this.urlLib = win.require('url');
      //this.del = win.require('del');
      this.subscribeElectronDownloadCompletions();
      this.subscribeElectronDownloadUpdates();
      this.subscribeElectronModalDisplay();
    }

  }

  //subscribe to channel on which download completion events are published
  //feed values to subject
  private subscribeElectronDownloadCompletions() {
    this.ipcRenderer.on("download-finished", (event, item: DownloadedItem) => {
      if (this.booksDownloadQueue.indexOf(item.srcUrl) > -1) {
        this.removeFromDownloadQueue(item.srcUrl);
      }
      if (item.state == "completed") {
        this.booksDownloadedList.push(item);
      }
      this.downloadeCompletionSubject.next(item);
    });
  }

  public removeFromDownloadQueue(contentUrl: string) {
    let idx = this.booksDownloadQueue.indexOf(contentUrl);
    if (idx > -1) {
      this.booksDownloadQueue.splice(idx, 1);
    }
  }

  public addToDownloadQueue(contentUrl: string) {
    this.booksDownloadQueue.push(contentUrl);
  }

  public getBooksInDownloadQueue(): string[] {
    return this.booksDownloadQueue;
  }

  public removeFromDownloadedBooks(contentUrl: string) {
    let idx: number = -1;
    for (let i = 0; i < this.booksDownloadedList.length; i++) {
      if (this.booksDownloadedList[i].srcUrl == contentUrl) {
        idx = i;
        break;
      }
    }
    if (idx > -1) {
      this.booksDownloadedList.splice(idx, 1);
    }
  }

  public getDownloadedBooks(): DownloadedItem[] {
    return this.booksDownloadedList;
  }

  //subscribe to channel on which download update events are published
  //feed values to subject
  private subscribeElectronDownloadUpdates() {
    this.ipcRenderer.on("download-progress", (event, downloadProgress: DownloadProgress) => {
      this.downloadProgressSubject.next(downloadProgress);
    });
  }

  //subscribe to channel on which modal opened events are published
  private subscribeElectronModalDisplay(){
    this.ipcRenderer.on("modal-displayed", (event, modalDisplayed) => {
      this.modalWinDisplayed = modalDisplayed;
    });
  }

  public isModalDisplayed(): boolean {
    return this.modalWinDisplayed;
  }

  //allow subscribers access to download completetion events
  public getDownloadCompletionAsObservable(): Observable<DownloadedItem> {
    return this.downloadeCompletionSubject.asObservable();
  }

  //allow subscribers access to download update events
  public getDownloadProgressAsObservable(): Observable<DownloadProgress> {
    return this.downloadProgressSubject.asObservable();
  }


  public getBookByAccessKey(accessKeyInput: string): Observable<Book> {

    let requestUrl: string = Constants.BOOKS_URI.replace("{accessKey}", accessKeyInput);

    console.log("fetching book by token from url: " + requestUrl);

    return this.data.getAll<Book>(requestUrl).pipe(
      map((book) => {
        this.bookAccessKeyToDetailsMap.set(book.accessKey, book);
        return book;
      })
    );
  }

  public getMyBooks(): Promise<Book[]> {
    //load books from db 
    return this.sqlStorage.getBooks();
  }

  public saveBookDetails(book: Book): Promise<Book> {
    //save book details in DB
    return this.sqlStorage.saveBook(book);
  }

  public updateBookImageLocalUrl(book: Book): Promise<void> {
    return this.sqlStorage.updateBookImageLocalUrl(book);
  }

  public updateBookContentLocalUrl(book: Book): Promise<void> {
    return this.sqlStorage.updateBookContentLocalUrl(book);
  }

  public deleteBookContents(book: Book): Promise<void> {
    //delete book contents from filesystem, if downloaded
    if (book.contentLocalUrl) {
      const dirPath: string = this.commonUtils.getPathDirname(book.contentLocalUrl);

      this.commonUtils.deleteFileDirAtPath(dirPath).then(
        () => {
          console.log(`deleted path successfully: ${dirPath}`);
        },
        error => {
          console.log(`ERROR: delete path failed: ${dirPath} due to error:`);
          console.dir(error);
        });
    }
    //delete book image from filesystem, if downloaded
    if (book.imageLocalUrl) {
      const imgPath: string = book.imageLocalUrl;

      this.commonUtils.deleteFileDirAtPath(imgPath).then(
        () => {
          console.log(`deleted path successfully: ${imgPath}`);
        },
        error => {
          console.log(`ERROR: deleted path failed: ${imgPath} due to error:`);
          console.dir(error);
        });
    }
    //remove entry from db
    return this.sqlStorage.deleteBook(book);

  }

  public downloadBookContents(book: Book): void {
    console.log(`Renderer : download book contents from ${book.contentUrl}`);
    this.ipcRenderer.send("download-file", book.contentUrl);
  }

  public downloadBookImage(book: Book): void {
    console.log(`Renderer : download book image from ${book.imageUrl}`);

    this.ipcRenderer.send("download-file", book.imageUrl);
  }


  public playBookContents(url: string, forceOpen: boolean): void {
    console.log(`Renderer : play book contents from ${url}`);
    this.ipcRenderer.send("open-modal", url, forceOpen);
  }

}

export interface DownloadProgress {
  url: string;
  state: "progressing" | "interrupted";
  percent: number;
  itemTransferredBytes: number;
  itemTotalBytes: number;
  receivedBytes: number;
  totalBytes: number;
}

export interface DownloadedItem {
  srcUrl: string,
  savedAt: string,
  state: "completed" | "cancelled" | "interrupted"
}

export interface UnzipContentResult {
  status: 'success' | 'error',
  srcPath: string,
  destPath: string,
  err?: any
}