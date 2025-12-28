module.exports = {
  default: {
    require: [
      'features/hooks/**/*.js',
      'features/stepDefinitions/**/*.js',
      'features/support/**/*.js'
    ],
    format: ['progress'],
    paths: ['features/**/*.feature'],
    publishQuiet: true
  }
};