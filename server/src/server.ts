import chalk from 'chalk';
const expressStatusMonitor = require('express-status-monitor');

import { app } from './app';
import * as scheduler from 'node-schedule';
import { Scheduler } from './batchjob/Schedule';

const successSymbol = chalk.green('✓');

const server = app.listen(app.get('port'), () => {
  console.log(
    '%s App is running at http://localhost:%d in %s mode',
    successSymbol,
    app.get('port'),
    app.get('env')
  );

  const env = process.env;
  if (env.pm_id) {
    if (env.pm_id == '0') {
      // schedule your job here.
      console.log('Scheduler Started');

      const schedule = new Scheduler();
      scheduler.scheduleJob('5 * * * *', function () {
        console.log('Scheduler for google sheet test');
        try {
          schedule.getBatchInfo();
        } catch (e) {
          throw new Error(e);
        }
      });
    }
  } else {
    console.log('  ** PM2 is not using now. **');
  }
  console.log('  Press CTRL-C to stop\n');
});

// Web sockets setup
const io = require('socket.io')(server);

// Status monitor uses it's own socket.io instance by default, so w need to
// pass our instance as a parameter else it will throw errors on client side
app.use(expressStatusMonitor({ websocket: io, port: app.get('port') }));
