import { Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DownloadTokenComponent } from '../download-token/download-token.component';
import { ApiError } from '../model/api-error.model';
import { Book } from '../model/book.model';
import { BookService, DownloadedItem } from '../service/book.service';
import { CommonUtilService } from '../service/common-util.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  noBooksMessage: string;
  mybooks: Book[] = [];
  contentUrlToBookMap: Map<string, Book> = new Map();
  imageUrlToBookMap: Map<string, Book> = new Map();
  accessKeyToBookMap: Map<string, Book> = new Map();
  downProgressSubscription: Subscription;
  downCompleteSubscription: Subscription;

  readonly NO_BOOKS_MSG = "No books are available in the library.<br> Please click the ADD NEW BOOK button to download a book.";

  constructor(
    public dialog: MatDialog,
    private bookService: BookService,
    private commonUtils: CommonUtilService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    //load existing books data from db
    this.loadMyBooks();

    this.downProgressSubscription = this.bookService.getDownloadProgressAsObservable().pipe(throttleTime(500)).subscribe(
      downloadProgress => {
        let currentBook: Book = this.contentUrlToBookMap.get(downloadProgress.url);
        if (currentBook && downloadProgress.state == "progressing" && downloadProgress.percent > currentBook.downloadProgress) {
          console.log(`Download progress of ${downloadProgress.url.substring(downloadProgress.url.lastIndexOf('/') + 1)}: ${downloadProgress.percent}`);
          currentBook.downloadProgress = downloadProgress.percent;
          currentBook.downloadInProgress = true;
          this.changeDetectorRef.detectChanges();
        }
        else if (currentBook && downloadProgress.state == "interrupted") {
          //if content download cancelled
          currentBook.downloadInProgress = false;
          currentBook.downloadProgress = 0;
          this.bookService.removeFromDownloadQueue(currentBook.contentUrl);

          this.displayMsgInPopup('Content could not be downloaded, please make sure you are connected to the internet.');

        }
      }
    );

    this.downCompleteSubscription = this.bookService.getDownloadCompletionAsObservable().subscribe(
      downloadedItem => {
        //if downloaded file is content of book
        let currentBook: Book = this.contentUrlToBookMap.get(downloadedItem.srcUrl);
        if (currentBook) {
          if (downloadedItem.state == 'completed') {
            //for smooth UI of download progress
            currentBook.downloadProgress = 100;
            setTimeout(() => {
              currentBook.downloadInProgress = false;

              this.processContentDownload(downloadedItem, currentBook);

            }, 500);
            this.changeDetectorRef.detectChanges();
          }
          else {
            //if content download cancelled
            currentBook.downloadInProgress = false;
            currentBook.downloadProgress = 0;

            if (downloadedItem.state == 'interrupted') {
              this.displayMsgInPopup('Content could not be downloaded, please make sure you are connected to the internet.');
            }
          }
        }
        else {
          //if downloaded file is image of book
          currentBook = this.imageUrlToBookMap.get(downloadedItem.srcUrl);
          if (currentBook) {
            if (downloadedItem.state == 'completed') {
              currentBook.imageLocalUrl = downloadedItem.savedAt;
              console.log(`book image save at: ${currentBook.imageLocalUrl}`);
              //update image url for book in DB
              this.bookService.updateBookImageLocalUrl(currentBook).then(() => {
                console.log(`image detail updated in DB for book : ${currentBook.title}`);
              })
            }
          }
          else {
            console.log(`Unknown item downloaded:`);
            console.dir(downloadedItem);
          }
        }
      }
    );
  }


  processContentDownload(downloadedItem: DownloadedItem, currentBook: Book) {
    //clear item from list of downloaded items
    this.bookService.removeFromDownloadedBooks(downloadedItem.srcUrl);
    //unzip content
    const unzipToPath = downloadedItem.savedAt.substring(0, downloadedItem.savedAt.lastIndexOf('.'));
    this.commonUtils.unzipContent(downloadedItem.savedAt, unzipToPath).then(
      () => {
        //delete zip file
        this.commonUtils.deleteFileDirAtPath(downloadedItem.savedAt).then(() => {
          console.log(`deleted zip at ${downloadedItem.savedAt}`);
        });
        //set url in list
        currentBook.contentLocalUrl = this.commonUtils.joinPaths(downloadedItem.savedAt.substring(0, downloadedItem.savedAt.lastIndexOf('.')), 'index.html');
        //update in db
        this.bookService.updateBookContentLocalUrl(currentBook).then(() => {
          console.log(`content detail updated in DB for book : ${currentBook.title}`);
        })
        this.changeDetectorRef.detectChanges();
      },
      (err) => {
        console.error(`Could not unzip ${downloadedItem.savedAt}, error:`);
        console.dir(err);
        this.displayMsgInPopup('Content could not be processed, please try again later');
      }
    )
  }


  loadMyBooks() {
    console.log("loading list of my books...");
    //for processing downloads that might have happened when this view compomenent was not visible
    const itemsInDownloadQueue: string[] = this.bookService.getBooksInDownloadQueue();
    const downloadedItems: DownloadedItem[] = this.bookService.getDownloadedBooks();

    this.bookService.getMyBooks().then(
      (data: Book[]) => {
        data.forEach(book => {
          if (itemsInDownloadQueue.indexOf(book.contentUrl) > -1) {
            book.downloadInProgress = true;
            book.downloadProgress = 0;
          }
  
          this.mybooks.push(book);
          this.contentUrlToBookMap.set(book.contentUrl, book);
          this.imageUrlToBookMap.set(book.imageUrl, book);
          this.accessKeyToBookMap.set(book.accessKey, book);

        });

        //update books that might have downloaded in background
        downloadedItems.forEach((downloadedItem) => {
          if(this.contentUrlToBookMap.has(downloadedItem.srcUrl)){
            this.processContentDownload(downloadedItem, this.contentUrlToBookMap.get(downloadedItem.srcUrl));
          }
          //clear item from list of downloaded items
          this.bookService.removeFromDownloadedBooks(downloadedItem.srcUrl);
        })

        //display msg if no books available
        if (this.mybooks.length == 0) {
          this.noBooksMessage = this.NO_BOOKS_MSG;
        } else {
          this.noBooksMessage = null;
        }

        //sort
        this.sortBooksDisplayed();

        this.mybooks.forEach(mybook => {
          if (!mybook.imageLocalUrl) {
            //download book image again - previous download may have failed
            this.bookService.downloadBookImage(mybook);
          }
        })
      },
      error => {
        console.error("ERROR: cannot load books ", error);
      }
    )
  }

  displayDownloadTokenDialog(): void {
    const dialogRef = this.dialog.open(DownloadTokenComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe((token) => this.handleGetBookFromToken(token));
  }

  handleGetBookFromToken(token: string) {

    //if user has entered token
    if (token) {
      let existingBook: Book = this.accessKeyToBookMap.get(token);
      if (existingBook) {
        //book already downloaded
        this.displayMsgInPopup(`You already have the book with token <i>${token}</i><br>Book title: ${existingBook.schoolClass} - ${existingBook.title}`);
        return;
      }
      //call service to fetch book details 
      this.bookService.getBookByAccessKey(token).subscribe(
        book => {
          //add book to list displayed
          book["dateAdded"] = new Date();
          this.mybooks.push(book);
          this.contentUrlToBookMap.set(book.contentUrl, book);
          this.imageUrlToBookMap.set(book.imageUrl, book);
          this.accessKeyToBookMap.set(book.accessKey, book);
          this.noBooksMessage = null;

          //sort
          this.sortBooksDisplayed();

          //save book info in DB
          this.bookService.saveBookDetails(book).then(() => {
            console.log(`book saved successfully: ${book.title}`);
          })
          //download book image
          this.bookService.downloadBookImage(book);
        },
        (errorResponse: HttpErrorResponse) => {
          console.error(`ERROR: while fetching book details with token ${token} --- Error:`);
          console.dir(errorResponse);
          let msg = "Could not process token, please try again later.";
          if (this.isInvalidTokenError(errorResponse)) {
            msg = "Please enter a valid token number.";
          }
          else if (!navigator.onLine) {
            msg = "Could not process token, please make sure you are connected to the internet.";
          }

          this.displayMsgInPopup(msg);
        }
      )
    }
  }

  isInvalidTokenError(errorResponse: HttpErrorResponse): boolean {
    if (Array.isArray(errorResponse.error)) {
      let fetchError: ApiError = (<ApiError[]>errorResponse.error)[0];
      return (fetchError.code === "4000101");
    }

    return false;
  }

  //sorts in descending order - latest book displayed first
  sortBooksDisplayed() {
    this.mybooks.sort((b1: Book, b2: Book) => {
      return b2.dateAdded.getTime() - b1.dateAdded.getTime();
    })
  }

  displayMsgInPopup(msg: string): MatDialogRef<ConfirmationDialogComponent> {
    return this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        msg: msg,
        okButtonText: "OK"
      }
    });
  }

  playBookContent(book: Book, index: number) {
    //invoke service method for book content play

    if (this.commonUtils.isFileExists(book.contentLocalUrl)) {
      console.log(`content found locally..opening`);
      this.bookService.playBookContents(this.commonUtils.formatUrl(book.contentLocalUrl));
    }
    else {
      let confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          msg: "Could not launch - your downloaded content may have been deleted. Would you like to delete this book?",
          okButtonText: "Delete",
          cancelButtonText: "Cancel"
        }
      });

      confirmDialog.afterClosed().subscribe(data => {
        console.log("User pressed " + data.buttonPressed);
        if (data.buttonPressed == "Delete") {
          this.deleteBook(book, index);
        }
      });
    }
  }

  //called from UI
  downloadBookContent(book: Book) {
    let currentBook: Book = this.contentUrlToBookMap.get(book.contentUrl);
    currentBook.downloadInProgress = true;
    currentBook.downloadProgress = 0;
    this.bookService.addToDownloadQueue(currentBook.contentUrl);

    this.bookService.downloadBookContents(book);
  }

  confirmAndDeleteBookContent(book: Book, index: number) {

    let confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        msg: "Are you sure you want to delete this book?",
        okButtonText: "Delete",
        cancelButtonText: "Cancel"
      }
    });

    confirmDialog.afterClosed().subscribe(data => {
      console.log("User pressed " + data.buttonPressed);
      if (data.buttonPressed == "Delete") {
        this.deleteBook(book, index);
      }
    });
  }

  deleteBook(book: Book, index: number) {
    this.bookService.deleteBookContents(book).then(
      () => {
        //remove book from display
        this.mybooks.splice(index, 1);
        this.contentUrlToBookMap.delete(book.contentUrl);
        this.imageUrlToBookMap.delete(book.imageUrl);
        this.accessKeyToBookMap.delete(book.accessKey);
        if (this.mybooks.length == 0) {
          //if no books remaining
          this.noBooksMessage = this.NO_BOOKS_MSG;
        }
      }
    )
  }

  getImageUrl(book: Book): string {
    if (book.imageLocalUrl) {
      //console.log("book's local image used from " + book.imageLocalUrl);
      return this.commonUtils.formatUrl(book.imageLocalUrl);
    }

    //console.log("book's online image used from " + book.imageUrl);

    return book.imageUrl;

  }

  ngOnDestroy(): void {
    this.downProgressSubscription.unsubscribe();
    this.downCompleteSubscription.unsubscribe();
  }

}
