## Queue packaging concept

### Queue package [description](queue/README.md)

### To emulate npm package registry:

In `queue` directory:
> npm link

In `producer` directory:
> npm link @theguarantors/queue

In `consumer` directory:
> npm link @theguarantors/queue


### To install dependencies in each directory execute:

> npm install

### To compile and run:

In `queue` directory:
> npm run compile

In `producer` directory:
> npm start

In `consumer` directory:
> npm start
