import { app, BrowserWindow, ipcMain, screen, DownloadItem, shell, dialog, Menu } from "electron";
import { DownloadOptions } from "./downloader";
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import * as unzipper from 'unzipper';
import * as del from 'del';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow = null;

//hide menu
Menu.setApplicationMenu(null);

// check if serve-ing from localhost
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve'),
  dev = args.some(val => val === '--dev');


function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false
      // webSecurity: false
    },
  });

  win.maximize();

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/DigiBook/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve || dev) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    cleanup();
    win = null;
  });

  return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//downloader code


const pupa = require('pupa');
const extName = require('ext-name');

const getFilenameFromMime = (name, mime) => {
  const extensions = extName.mime(mime);

  if (extensions.length !== 1) {
    return name;
  }

  return `${name}.${extensions[0].ext}`;
};

class DownloadDetails {
  downloadingItem: DownloadItem;
  constructor(public url: string, public options: DownloadOptions) { }
}

const downloadItems = new Set<DownloadItem>();
const urlToDownDetailsMap: Map<string, DownloadDetails> = new Map();
let receivedBytes = 0;
let completedBytes = 0;
let totalBytes = 0;
const activeDownloadItems = () => urlToDownDetailsMap.size;
const progressDownloadItems = () => receivedBytes / totalBytes;

function downloaderCleanup() {
  downloadItems.clear();
  urlToDownDetailsMap.clear();
}

function registerListener(session: Electron.session) {


  const listener = (event: Electron.Event, item: DownloadItem, webContents: Electron.WebContents) => {

    console.log(`main: will-download triggered for item ${item.getURL()}`);

    //identify item being downloaded and its options
    const downDetails: DownloadDetails = urlToDownDetailsMap.get(item.getURL());
    downDetails.downloadingItem = item;
    const options: DownloadOptions = downDetails.options;

    //maintain collection of download items for total download stats
    downloadItems.add(item);
    //add to total bytes to be downed
    totalBytes += item.getTotalBytes();

    //identify window
    let hostWebContents = webContents;
    if (webContents.getType() === 'webview') {
      ({ hostWebContents } = webContents);
    }
    const window_ = BrowserWindow.fromWebContents(hostWebContents);

    const directory: string = options.directory || app.getPath('downloads');
    let filePath: string;
    if (options.filename) {
      filePath = path.join(directory, options.filename);
    } else {
      const filename = item.getFilename();
      const name = path.extname(filename) ? filename : getFilenameFromMime(filename, item.getMimeType());
      filePath = path.join(directory, name);
      //filePath = unusedFilename.sync(path.join(directory, name));
    }

    if (!options.saveAs) {
      item.savePath = filePath;
    }

    const errorMessage = options.errorMessage || 'The download of {filename} was interrupted';
    const errorTitle = options.errorTitle || 'Download Error';
    let showBadge: boolean = options.showBadge || true;

    console.log(`main: download started for item ${item.getURL()} -- saving at ${item.savePath}`);

    if (typeof options.onStarted === 'function') {
      options.onStarted(item);
    }

    item.on('updated', (event, state) => {
      console.log(`Update event received -- item: ${item.getURL()}, state: ${state}`);
      if (state == "progressing") {

        receivedBytes = Array.from(downloadItems.values()).reduce((receivedBytes, item) => {
          receivedBytes += item.getReceivedBytes();
          return receivedBytes;
        }, completedBytes);



        if (showBadge && ['darwin', 'linux'].includes(process.platform)) {
          app.badgeCount = activeDownloadItems();
        }

        if (!window_.isDestroyed()) {
          window_.setProgressBar(progressDownloadItems());
        }


        const itemTransferredBytes = item.getReceivedBytes();
        const itemTotalBytes = item.getTotalBytes();

        let downloadProgress = {
          url: item.getURL(),
          percent: Math.floor(itemTotalBytes ? (itemTransferredBytes / itemTotalBytes) * 100 : 0),
          itemTransferredBytes: itemTransferredBytes,
          itemTotalBytes: itemTotalBytes,
          totalBytes: totalBytes,
          receivedBytes: receivedBytes

        }

        console.log(`Download progress:`);
        console.dir(downloadProgress);

        //send progress to web content that triggered this download
        webContents.send("download-progress", downloadProgress);
      }
    });

    item.on('done', (event, state) => {
      completedBytes += item.getTotalBytes();
      //clean up collections
      console.log(`Done event received -- item: ${item.getURL()}, state: ${state}`);
      console.log(`removing from collections -- item: ${item.getURL()}`);

      downloadItems.delete(item);
      urlToDownDetailsMap.delete(item.getURL());

      if (showBadge && ['darwin', 'linux'].includes(process.platform)) {
        app.badgeCount = activeDownloadItems();
      }

      if (!window_.isDestroyed() && !activeDownloadItems()) {
        window_.setProgressBar(-1);
        receivedBytes = 0;
        completedBytes = 0;
        totalBytes = 0;
      }

      if (state === 'cancelled') {
        console.log(`main: download cancelled for file ${item.getFilename()}`);
        if (typeof options.onCancel === 'function') {
          options.onCancel(item);
        }
      } else if (state === 'interrupted') {
        console.log(`main: download interrupted for file ${item.getFilename()}`);
        const message = pupa(errorMessage, { filename: item.getFilename() });
        dialog.showErrorBox(errorTitle, message);
        if (typeof options.onComplete === 'function') {
          options.onComplete(new Error(message), null);
        }
      } else if (state === 'completed') {
        console.log(`main: download completed for file ${item.getFilename()}`);
        if (process.platform === 'darwin') {
          app.dock.downloadFinished(filePath);
        }

        if (options.openFolderWhenDone) {
          shell.showItemInFolder(path.join(directory, item.getFilename()));
        }
        if (typeof options.onComplete === 'function') {
          options.onComplete(null, item);
        }
      }

      const downloadedItem = {
        srcUrl: item.getURL(),
        savedAt: item.savePath,
        state: state
      }
      webContents.send("download-finished", downloadedItem);
    });
  };

  session.on('will-download', listener);
}

//listen to session creation so that we can listen to 'will-download' events of each session
app.on('session-created', session => {
  //listen to each session's will-download event
  registerListener(session);
});


//downloader code -- ends


const downloadOptions: DownloadOptions = {
  directory: path.join(app.getPath("userData"), "MyContent"),
  errorMessage: "Download could not be completed. Please try again later."
}

ipcMain.on('download-file', (event, url) => {
  let downDetails: DownloadDetails = new DownloadDetails(url, downloadOptions);
  //add download to set
  urlToDownDetailsMap.set(url, downDetails);
  //trigger download

  console.log(`main: triggering download for url : ${url}`);
  event.sender.downloadURL(url);
});

let modalWindow: BrowserWindow = null;

ipcMain.on('open-modal', (event, targetUrl) => {
  console.log(`main: open modal for url : ${targetUrl}`);
  if (!modalWindow) {
    modalWindow = new BrowserWindow({
      parent: win,
      modal: true,
      show: false,
      resizable: false
    });
    modalWindow.maximize();
    modalWindow.loadURL(targetUrl);

    modalWindow.once('ready-to-show', () => {
      modalWindow.show();
    });
    modalWindow.on('closed', () => {
      modalWindow = null;
    });
  }
  else {
    console.log(`a modal is already open`);
  }
});


ipcMain.handle('unzip-file', async (event, srcPath, destPath) => {
  let result: { status: 'success' | 'error', srcPath: string, destPath: string, err?: any } = {
    status: 'success',
    srcPath: srcPath,
    destPath: destPath
  };
  try {
    console.log(`main: start unzip of ${srcPath} to dest ${destPath}`);
    await fs.createReadStream(srcPath).pipe(unzipper.Extract({ path: destPath })).promise();
    console.log(`main: completed unzip of ${srcPath} to dest ${destPath}`);
  } catch (err) {
    result.status = 'error';
    result.err = JSON.stringify(err);
    console.log(`main: ERROR in unzip of ${srcPath} to dest ${destPath}`);
  }
  return result;
})

ipcMain.handle('delete-file', async (event, pathToDelete: string) => {
  let result: { status: 'success' | 'error', path: string, err?: any } = {
    status: 'success',
    path: pathToDelete
  };
  //safety check to avoid multiple malicious deletions at all costs
  if (pathToDelete.indexOf("*") > -1) {
    result.status = 'error';
    result.err = 'paths with glob pattern detected -- aborting delete operation';
    console.log(result.err);
    return result;
  }
  else {
    try {
      if (pathToDelete.startsWith('file:///')) {
        pathToDelete = pathToDelete.substring('file:///'.length);
      }
      pathToDelete = pathToDelete.split("\\").join("/");
      console.log(`main: deleting file/dir at path : ${pathToDelete}`);
      await del(pathToDelete, { force: true });
      console.log(`main: completed deletion of ${pathToDelete}`);
    } catch (err) {
      result.status = 'error';
      result.err = err;
      console.log(`main: ERROR in deletion of ${pathToDelete}, error: `);
      console.log(err);
    }
    return result;
  }
})

/**
 * perform clean-up activities for different sections
 */
function cleanup() {
  downloaderCleanup();
}