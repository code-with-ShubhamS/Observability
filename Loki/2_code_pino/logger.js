import pino from "pino";
import PinoPretty from "pino-pretty";

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: false,
          destination: "./myAppLogs/logs.log",
          mkdir: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        },
      },
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          destination: 1,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        },
      },
    ],

    reddact: {
      paths: ["password", "secret"],
      remove: true,
    },
  },
});

export default logger;
