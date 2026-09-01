import { Writable } from 'node:stream';
import pino from 'pino';
import pretty from 'pino-pretty';
import { writeTerm } from './term';

const level = process.env.LOG_LEVEL || 'debug';

const prettyOptions = {
  colorize: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname,module'
};

export const logger = process.stdout.isTTY
  ? pino(
      { level },
      pretty({
        ...prettyOptions,
        destination: new Writable({
          write(chunk, _encoding, callback) {
            writeTerm(chunk.toString());
            callback();
          }
        })
      })
    )
  : pino({
      level,
      transport: {
        target: 'pino-pretty',
        options: prettyOptions
      }
    });
