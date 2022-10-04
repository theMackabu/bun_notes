const classes = process.env.CLASSES.trim().replace(/,\s*$/, '').split(',');
const port = parseInt(process.env.PORT) || 3000;

export { classes, port };