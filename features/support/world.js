const { setWorldConstructor } = require('@cucumber/cucumber');

class CustomWorld {
  constructor() {
    this.context = null;
    this.page = null;
  }
}

setWorldConstructor(CustomWorld);