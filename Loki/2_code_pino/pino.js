import pino, { destination } from "pino";

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: false,
          destination: "./logs.log",
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
  },
  redact: {paths: ["password", "secret"],remove: true},
  customLevels: {
    highestErrorRate: 100,
  },
});
const user = {
  name: "John Doe",
  email: "jhon@gmail.com",
  password: "mysecretpassword",
  secret: "mysecretvalue",
  isHuman: true,
};    

const userLogger = logger.child( user );  //pass only one time 

userLogger.info("This is an info message with user data");
userLogger.warn("This is a warning message with user data");
userLogger.error("This is an error message with user data");
