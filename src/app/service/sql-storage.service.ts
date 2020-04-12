import { app } from 'electron';
import * as nedb from 'nedb';

import { Injectable } from '@angular/core';

import { Book } from '../model/book.model';

const win = (<any>window);

@Injectable({
  providedIn: 'root'
})
export class SqlStorageService {
  //electron/native imports
  nedb: typeof nedb;
  app: typeof app;

  appDB: {
    books: nedb
  };
  constructor() {
    if (this.isElectron) {
      this.app = win.require('electron').remote.app;
      this.nedb = win.require('nedb');
      if (this.nedb) {
        this.initDB();
      }
    }
  }

  initDB() {
    console.log(`Setting up DB...`);
    const dbFilePath = `${this.app.getPath("downloads")}/data`;
    //instantiate each collection's object
    this.appDB = {
      books: new this.nedb({
        filename: `${dbFilePath}/books.db`,
        autoload: true,
        onload: (error) => {
          if (error) {
            console.error(`DB could not be loaded, error:`);
            console.dir(error);
          }
        }
      })
    }
  }

  get isElectron(): boolean {
    return !!(win && win.process && win.process.type);
  }

  public getBooks(): Promise<Book[]> {

    console.log("Fetching books from DB...");
    return new Promise((resolve, reject) => {
      this.appDB.books.find<Book>({}, (err, bookEntities: Book[]) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(bookEntities);
        }
      })
    });
  }

  public saveBook(book: Book): Promise<Book> {

    console.log(`Save book details in DB... Book:`);
    console.dir(book);

    //avoid saving useless fields
    book.downloadInProgress = undefined;
    book.downloadProgress = undefined;

    return new Promise((resolve, reject) => {
      this.appDB.books.insert<Book>(book, (err, bookEntity) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(bookEntity);
        }
      })
    });
  }

  public updateBookImageLocalUrl(book: Book): Promise<void> {

    console.log(`Update book image local in DB... Book:`);
    console.dir(book);

    return new Promise((resolve, reject) => {
      this.appDB.books.update({ accessKey: book.accessKey }, { $set: { imageLocalUrl: book.imageLocalUrl } }, {}, (err, numUpdated) => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      })
    });
  }

  public updateBookContentLocalUrl(book: Book): Promise<void> {

    console.log(`Update book content local url in DB... Book:`);
    console.dir(book);

    return new Promise((resolve, reject) => {
      this.appDB.books.update({ accessKey: book.accessKey }, { $set: { contentLocalUrl: book.contentLocalUrl } }, {}, (err, numUpdated) => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      })
    });
  }

  public deleteBook(book: Book): Promise<void> {

    console.log(`Delete book details from DB... Book:`);
    console.dir(book);

    return new Promise((resolve, reject) => {
      this.appDB.books.remove({ accessKey: book.accessKey }, {}, (err, numRemoved) => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      })
    });
  }


}
