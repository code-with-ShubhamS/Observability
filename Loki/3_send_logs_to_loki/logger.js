import pino from "pino";

const logger = pino({
  transport: {
    targets: [
      // Sending logs to loki 
      // {
      //   target: "pino-loki",
      //   options: {
      //     host: "http://localhost:3100",
      //     labels : {
      //       app : "express-app"
      //     }
      //   },
      // },
      {
        // Print in File
        target: "pino/file",
        options: {
          colorize: false,
          destination: "./app.log",
          mkdir: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        },
      },
      // {
        // Print in CLI
      //   target: "pino-pretty",
      //   options: {
      //     colorize: true,
      //     destination: 1,
      //     translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
      //   },
      // },
    ],

    reddact: {
      paths: ["password", "secret"],
      remove: true,
    },
  },
});

export default logger;
