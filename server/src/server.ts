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
  console.log('Scheduler Started');

  const schedule = new Scheduler();
  scheduler.scheduleJob('* * * * *', async function () {
    console.log('Scheduler for collecting Data');
    try {
      const result = await schedule.getBatchInfo();
      console.log(result.message);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  });

  console.log('Press CTRL-C to stop\n');
});

// Web sockets setup
const io = require('socket.io')(server);

// Status monitor uses it's own socket.io instance by default, so w need to
// pass our instance as a parameter else it will throw errors on client side
app.use(expressStatusMonitor({ websocket: io, port: app.get('port') }));
