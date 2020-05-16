const { app } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

let viewWin;

exports.setupUpdater = (win) => {
    viewWin = win;
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    log.info('Setting up app updater...');


    function sendStatusToWindow(text, info) {
        log.info(text);
        if (viewWin && viewWin.webContents && !viewWin.webContents.isDestroyed()) {
            viewWin.webContents.send('updater-message', text, info);
        }
    }

    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
    })
    autoUpdater.on('update-available', (info) => {
        sendStatusToWindow('UPDATE_AVAILABLE', info);
    })
    autoUpdater.on('update-not-available', (info) => {
        log.info('Update not available.');
    })
    autoUpdater.on('error', (err) => {
        log.info('Error in auto-updater. ' + err);
    })
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        log.info(log_message);
    })
    autoUpdater.on('update-downloaded', (info) => {
        sendStatusToWindow('UPDATE_DOWNLOADED', info);
    });


    //-------------------------------------------------------------------
    // Auto updates - Option 1 - Simplest version
    //
    // This will immediately download an update, then install when the
    // app quits.
    //-------------------------------------------------------------------
    if (app.isReady()) {
        log.info('App ready... look for updates and notify');
        autoUpdater.checkForUpdatesAndNotify();
    }


}
