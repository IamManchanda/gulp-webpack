import primary from './primary';

class Person {
  constructor(name) {
    this.name = name;
  }

  hello() {
    if (typeof this.name === 'string') return `Hello, I am ${this.name}!`;
    return 'Hello!';
  }
}

const harry = new Person('Harman Manchanda');
console.log(harry.hello());
console.log(primary());
